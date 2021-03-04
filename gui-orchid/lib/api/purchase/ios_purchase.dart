import 'dart:async';
import 'package:in_app_purchase/store_kit_wrappers.dart';
import 'package:orchid/api/orchid_pricing.dart';
import '../orchid_api.dart';
import '../orchid_log_api.dart';
import 'orchid_pac.dart';
import 'orchid_pac_server.dart';
import 'orchid_pac_transaction.dart';
import 'orchid_purchase.dart';
import 'package:intl/intl.dart';

class IOSOrchidPurchaseAPI
    implements OrchidPurchaseAPI, SKTransactionObserverWrapper {
  /// Default prod service endpoint configuration.
  /// May be overridden in configuration with e.g.
  /// 'pacs = {
  ///    enabled: true,
  ///    url: 'https://sbdds4zh8a.execute-api.us-west-2.amazonaws.com/dev/apple',
  ///    verifyReceipt: false,
  ///    debug: true
  ///  }'
  static PACApiConfig prodAPIConfig = PACApiConfig(
      enabled: true,
      url: 'https://veagsy1gee.execute-api.us-west-2.amazonaws.com/prod/apple');

  /// Return the API config allowing overrides from configuration.
  @override
  Future<PACApiConfig> apiConfig() async {
    return OrchidPurchaseAPI.apiConfigWithOverrides(prodAPIConfig);
  }

  @override
  void initStoreListener() async {
    log("iap: init store listener");

    if (OrchidAPI.mockAPI) {
      await _recoverTx();
      return;
    }

    SKPaymentQueueWrapper().setTransactionObserver(this);

    // Log all PAC Tx activity for now
    await PacTransaction.shared.ensureInitialized();
    PacTransaction.shared.stream().listen((PacTransaction tx) {
      log("iap: PAC Tx updated: ${tx == null ? '(no tx)' : tx}");
    });

    // Note: This is an attempt to mitigate an "unable to connect to iTunes Store"
    // Note: error observed in TestFlight by starting the connection process earlier.
    // Note: Products are otherwise fetched immediately prior to purchase.
    try {
      await requestProducts();
    } catch (err) {
      log("iap: error in request products: $err");
    }

    await _recoverTx();
  }

  Future<void> _recoverTx() async {
    // Reset any existing tx after an app restart.
    var tx = await PacTransaction.shared.get();
    if (tx != null) {
      log("iap: Found PAC tx in progress after app startup: $tx");
      tx.state = PacTransactionState.WaitingForUserAction;
      return tx.save();
    }
  }

  /// Initiate a PAC purchase. The caller should watch PacTransaction.shared
  /// for progress and results.
  Future<void> purchase(PAC pac) async {
    log("iap: purchase pac");

    // Testing...
    if (OrchidAPI.mockAPI) {
      log("iap: mock purchase, delay");
      Future.delayed(Duration(seconds: 2)).then((_) {
        PacAddBalanceTransaction.pending(productId: "1234").save();
        log("iap: mock purchase, advance with receipt");
        OrchidPACServer().advancePACTransactionsWithReceipt("receipt");
      });
      return;
    }

    // Check purchase limit
    if (!await OrchidPurchaseAPI.isWithinPurchaseRateLimit(pac)) {
      throw PACPurchaseExceedsRateLimit();
    }

    // Refresh the products list:
    // Note: Doing this on app start does not seem to be sufficient.
    await requestProducts();

    // Ensure no other transaction is pending completion.
    if (await PacTransaction.shared.hasValue()) {
      throw Exception('PAC transaction already in progress.');
    }
    var payment = SKPaymentWrapper(productIdentifier: pac.productId);
    try {
      log("iap: add payment to queue");
      PacAddBalanceTransaction.pending(productId: pac.productId).save();
      await SKPaymentQueueWrapper().addPayment(payment);
    } catch (err) {
      log("Error adding payment to queue: $err");
      // The exception will be handled by the calling UI. No tx started.
      rethrow;
    }
  }

  /// Gather results of an in-app purchase.
  @override
  void updatedTransactions(
      {List<SKPaymentTransactionWrapper> transactions}) async {
    log("iap: received (${transactions.length}) updated transactions");
    for (SKPaymentTransactionWrapper tx in transactions) {
      switch (tx.transactionState) {
        case SKPaymentTransactionStateWrapper.purchasing:
          log("iap: IAP purchasing state");
          if (PacTransaction.shared.get() == null) {
            log("iap: Unexpected purchasing state, recreating pending tx.");
            PacAddBalanceTransaction.pending(
                productId: tx.payment.productIdentifier)
                .save();
          }
          break;

        case SKPaymentTransactionStateWrapper.restored:
        // Are we getting this on a second purchase attempt that we dropped?
        // Attempting to just handle it as a new purchase for now.
          log("iap: iap purchase restored?");
          _completeIAPTransaction(tx);
          break;

        case SKPaymentTransactionStateWrapper.purchased:
          log("iap: IAP purchased state");
          try {
            await SKPaymentQueueWrapper().finishTransaction(tx);
          } catch (err) {
            log("iap: error finishing purchased tx: $err");
          }
          _completeIAPTransaction(tx);
          break;

        case SKPaymentTransactionStateWrapper.failed:
          log("iap: IAP failed state");

          log("iap: finishing failed tx");
          try {
            await SKPaymentQueueWrapper().finishTransaction(tx);
          } catch (err) {
            log("iap: error finishing cancelled tx: $err");
          }

          if (tx.error?.code == OrchidPurchaseAPI.SKErrorPaymentCancelled) {
            log("iap: was cancelled");
            PacTransaction.shared.clear();
          } else {
            log("iap: IAP Failed, ${tx.toString()} error: type=${tx.error
                .runtimeType}, code=${tx.error.code}, userInfo=${tx.error
                .userInfo}, domain=${tx.error.domain}");
            PacAddBalanceTransaction.error("iap failed").save();
          }
          break;

        case SKPaymentTransactionStateWrapper.deferred:
          log("iap: iap deferred");
          break;
      }
    }
  }

  // The IAP is complete, update AML and the pending transaction status.
  Future _completeIAPTransaction(SKPaymentTransactionWrapper tx) async {

    // Record the purchase for rate limiting
    var productId = tx.payment.productIdentifier;
    try {
      Map<String, PAC> productMap = await OrchidPurchaseAPI().requestProducts();
      PAC pac = productMap[productId];
      OrchidPurchaseAPI.addPurchaseToRateLimit(pac);
    } catch (err) {
      log("pac: Unable to find pac for product id!");
    }

    // Get the receipt
    try {
      var receipt = await SKReceiptManager.retrieveReceiptData();

      // If the receipt is null, try to refresh it.
      // (This might happen if there was a purchase in flight during an upgrade.)
      if (receipt == null) {
        try {
          await SKRequestMaker().startRefreshReceiptRequest();
        } catch (err) {
          log("iap: Error in refresh receipt request");
        }
        receipt = await SKReceiptManager.retrieveReceiptData();
      }

      // If the receipt is still null there's not much we can do.
      if (receipt == null) {
        log(
            "iap: Completed purchase but no receipt found! Clearing transaction.");
        await PacTransaction.shared.clear();
        return;
      }

      // Pass the receipt to the pac system
      OrchidPACServer().advancePACTransactionsWithReceipt(receipt);
    } catch (err) {
      log("iap: error getting receipt data for completed iap: $err");
    }
  }

  static Map<String, PAC> productsCached;

  @override
  Future<Map<String, PAC>> requestProducts({bool refresh = false}) async {
    if (OrchidAPI.mockAPI) {
      int price = 0;
      List<PAC> pacs = OrchidPurchaseAPI.pacProductIds.map((id) {
        if (price > 4) {
          price += 5;
        } else {
          price += 1;
        }
        return PAC(
            productId: id,
            localCurrencyCode: "USD",
            localDisplayPrice: "\$$price.00",
            localPurchasePrice: 1.0);
      }).toList();
      return {for (var pac in pacs) pac.productId: pac};
    }
    if (productsCached != null && !refresh) {
      log("iap: returning cached products");
      return productsCached;
    }

    var productIds = OrchidPurchaseAPI.pacProductIds;
    log("iap: product ids requested: $productIds");
    SkProductResponseWrapper productResponse =
    await SKRequestMaker().startProductRequest(productIds);
    log("iap: product response: ${productResponse.products.map((p) => p
        .productIdentifier)}");

    var toPAC = (SKProductWrapper prod) {
      double localizedPrice = double.parse(prod.price);
      String currencyCode = prod.priceLocale.currencyCode;
      return PAC(
          productId: prod.productIdentifier,
          localPurchasePrice: localizedPrice,
          localCurrencyCode: currencyCode,
          localDisplayPrice:
          NumberFormat.currency(symbol: prod.priceLocale.currencySymbol)
              .format(localizedPrice),
          usdPriceApproximate: StaticExchangeRates.from(
            price: localizedPrice,
            currencyCode: currencyCode,
          ));
    };

    var pacs = productResponse.products.map(toPAC).toList();
    Map<String, PAC> products = {for (var pac in pacs) pac.productId: pac};
    productsCached = products;
    log("iap: returning products");
    return products;
  }

  @override
  bool shouldAddStorePayment(
      {SKPaymentWrapper payment, SKProductWrapper product}) {
    return true;
  }

  @override
  void paymentQueueRestoreCompletedTransactionsFinished() {}

  @override
  void removedTransactions({List<SKPaymentTransactionWrapper> transactions}) {
    log("removed transactions: $transactions");
  }

  @override
  void restoreCompletedTransactionsFailed({SKError error}) {
    log("restore failed");
  }
}

T cast<T>(dynamic x, {T fallback}) => x is T ? x : fallback;
