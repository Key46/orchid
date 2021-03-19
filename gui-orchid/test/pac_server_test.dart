/// Hide these from the CI server
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:orchid/api/orchid_crypto.dart';
import 'package:orchid/api/orchid_eth/token_type.dart';
import 'package:orchid/api/orchid_eth/v1/orchid_eth_v1.dart';
import 'package:orchid/api/pricing/orchid_pricing.dart';
import 'package:orchid/api/purchase/orchid_pac_seller.dart';
import 'package:orchid/api/purchase/orchid_pac_server.dart';
import 'package:orchid/api/purchase/orchid_purchase.dart';

///
/// Server integration tests
///
void main() async {
  // Disable for the CI
  const bool disabled = false;
  if (disabled) {
    print("Disabled.");
    return;
  }

  // Un-mock the http client
  // TestWidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = _TestHttpOverrides();

  var signer =
      EthereumAddress.from('0x92cFa426Cb13Df5151aD1eC8865c5C6841546603');
  var receipt = (await File('test/receipt_local.txt').readAsString()).trim();

  PacApiConfig apiConfig = PacApiConfig(
      url: 'https://sbdds4zh8a.execute-api.us-west-2.amazonaws.com/dev');

  group('Pac server', () {
    //

    test('get balance', () async {
      print("Get balance...");
      var account = await OrchidPACServer().getAccount(signer: signer, apiConfig: apiConfig);
      print("account: $account");
    });

    test('get L3 nonce', () async {
      print("Get L3 Nonce...");
      var signer = EthereumAddress.from('0xD9B90C0A03d9Cf7aa2680773f81D62B761A41F65');
      await OrchidPacSeller.getL3Nonce(chain: Chains.xDAI, signer: signer);
    });

    test('add balance', () async {
      print("Add balance...");
      await OrchidPACServer()
          .addBalance(signer: signer, receipt: receipt, apiConfig: apiConfig);
      print("Add balance complete...");
    });

    /*
    test('submit raw tx', () async {
      print("Submit raw...");
      var adjust = BigInt.from(1e17); // 0.1
      var retrieve = BigInt.from(0);
      // A move transaction
      EthereumTransaction tx = EthereumTransaction(
        params: EthereumTransactionParams(
            from: signer,
            // lottery contract address v1 (in flux)
            to: EthereumAddress.from(
                "0xA67D6eCAaE2c0073049BB230FB4A8a187E88B77b"),
            gas: 175000,
            gasPrice: BigInt.from(1e9),
            value: BigInt.from(1e18),
            chainId: Chains.xDAI.chainId),
        // No nonce
        // nonce: ...
        data: OrchidContractV1.abiEncodeMove(signer, adjust, retrieve),
      );

      await OrchidPACServer().submitSellerTransaction(
          signer: signer,
          chainId: Chains.xDAI.chainId,
          txParams: tx,
          apiConfig: apiConfig);
      print("Submit raw complete...");
    });
     */

    test('get Binance exchange rates', () async {
      // discontinued pair ordering
      var rate1 = await BinanceExchangeRateSource(
              symbolOverride: 'DAI', inverted: false)
          .tokenToUsdRate(TokenTypes.XDAI);
      var rate2 =
          await BinanceExchangeRateSource(symbolOverride: 'DAI', inverted: true)
              .tokenToUsdRate(TokenTypes.XDAI);
      print("$rate1, $rate2");
    });

    test('get Binance exchange rates 2', () async {
      var price = await OrchidPricing().tokenToUsdRate(TokenTypes.XDAI);
      // get again cached
      price = await OrchidPricing().tokenToUsdRate(TokenTypes.XDAI);
      print("xdai to usd = $price");
    });

    test('get Binance exchange rates 3', () async {
      var price = await OrchidPricing().tokenToUsdRate(TokenTypes.ETH);
      print("eth to usd = $price");
      price = await OrchidPricing().tokenToUsdRate(TokenTypes.OXT);
      print("oxt to usd = $price");
    });

    test('get bandwidth price', () async {
      var price = await OrchidEthereumV1.getBandwidthPrice();
      print("bandwidth price = $price");
    });
  });
}

class _TestHttpOverrides extends HttpOverrides {}