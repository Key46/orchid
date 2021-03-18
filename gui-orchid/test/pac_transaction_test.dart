import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:orchid/api/orchid_crypto.dart';
import 'package:orchid/api/orchid_eth/eth_transaction.dart';
import 'package:orchid/api/purchase/orchid_pac_transaction.dart';

import 'expect.dart';

void main() {
  PacTransaction roundTrip(PacTransaction tx) {
    return PacTransaction.fromJson(jsonDecode(jsonEncode(tx)));
  }

  var signer =
      EthereumAddress.from('0x00A0844371B32aF220548DCE332989404Fda2EeF');
  var signerKey = StoredEthereumKey.generate();
  var ethTx = EthereumTransaction(
      params: EthereumTransactionParams(
          from: signer,
          to: EthereumAddress.from(
              "0xA67D6eCAaE2c0073049BB230FB4A8a187E88B77b"),
          gas: 175000,
          gasPrice: BigInt.from(1e9),
          value: BigInt.from(1e18),
          chainId: 100,
          nonce: 1),
      data: '0x987ff31c000000000...');

  group('Pac transaction should serialize and deserialize correctly', () {
    test('raw eth tx round trip optional nonce', () {
      var txIn = EthereumTransaction(
          params: EthereumTransactionParams(
              from: EthereumAddress.from(
                  "0x00A0844371B32aF220548DCE332989404Fda2EeF"),
              to: EthereumAddress.from(
                  "0xA67D6eCAaE2c0073049BB230FB4A8a187E88B77b"),
              gas: 175000,
              gasPrice: BigInt.from(1e9),
              value: BigInt.from(1e18),
              chainId: 100),
          data: '0x987ff31c000000000...');

      var txOut =
          EthereumTransaction.fromJson(jsonDecode(jsonEncode(txIn)));
      expectTrue(txOut.nonce == null);
      expect(txIn.toJson().toString(), isNot(contains("nonce")));
      expectTrue(txIn == txOut);
      expectTrue(txIn.toJson().toString() == txOut.toJson().toString());
      expect(txOut.params.chainId, equals(100));
    });

    test('legacy', () {
      // legacy tx
      var legacyJson =
          '{"productId":"1234","transactionId":null,"state":"PacTransactionStateV0.Pending","receipt":null,"date":"2021-03-01T22:56:14.085235","retries":"0","serverResponse":null}';
      PacTransaction tx1 = PacTransaction.fromJson(jsonDecode(legacyJson));
      expectTrue(tx1.type == PacTransactionType.None);
      expect(tx1.date, isNotNull);
    });

    test('add balance error', () {
      var txIn = PacAddBalanceTransaction.error("error string");
      PacAddBalanceTransaction tx = roundTrip(txIn);
      expectTrue(tx is PacAddBalanceTransaction);
      expect(tx.state, PacTransactionState.Error);
      expect(tx.serverResponse, "error string");
      expect(tx.signer, null);
    });

    test('seller tx', () {
      var tx = PacSubmitSellerTransaction(
        signerKey: signerKey.ref(),
        txParams: ethTx,
        escrow: BigInt.from(123),
      );

      tx = roundTrip(tx);
      expect(tx.state, PacTransactionState.Pending);
      expectTrue(tx is PacSubmitSellerTransaction);
      expectTrue(tx.txParams.toJson().toString() ==
          ethTx.toJson().toString());
      expectTrue(tx.txParams == ethTx);
      expect(tx.escrow, equals(BigInt.from(123)));
      // print(submitRawTx.tx.toJson().toString());
    });

    test('add balance receipt', () {
      var tx =
          PacAddBalanceTransaction.pending(signer: signer, productId: "1234");

      tx = roundTrip(tx);
      expectTrue(tx is PacAddBalanceTransaction);
      expect(tx.productId, "1234");
      expect(tx.state, PacTransactionState.Pending);
      expect(tx.date, isNotNull);
      expect(tx.signer, signer);

      tx.retries = 3;
      tx.receipt = "receipt";
      tx = roundTrip(tx);
      expect(tx.retries, 3);
      expect(tx.receipt, "receipt");
    });

    test('purchase combined', () {
      var addBalance =
          PacAddBalanceTransaction.pending(signer: signer, productId: "1234");
      var submitRaw = PacSubmitSellerTransaction(
          signerKey: signerKey.ref(), txParams: ethTx, escrow: BigInt.zero);
      var tx = PacPurchaseTransaction(addBalance, submitRaw);

      var receipt = 'receipt:' + ('x' * 7000) + 'y';
      tx.addReceipt(receipt);

      tx = roundTrip(tx);

      expect(tx.addBalance, equals(addBalance));
      expect(tx.submitRaw, equals(submitRaw));

      addBalance = tx.addBalance;
      submitRaw = tx.submitRaw;
      expectTrue(tx is PacPurchaseTransaction);
      expectTrue(addBalance is PacAddBalanceTransaction);
      expectTrue(submitRaw is PacSubmitSellerTransaction);
      expect(addBalance.productId, "1234");
      expect(submitRaw.txParams, ethTx);
      expect(tx.type, PacTransactionType.PurchaseTransaction);
      expect(tx.state, PacTransactionState.Ready);
      expect(tx.date, isNotNull);
      expect(tx.receipt, receipt);
    });

    test('raw eth tx round trip', () {
      var txOut = EthereumTransaction.fromJson(jsonDecode(jsonEncode(ethTx)));
      expectTrue(ethTx.from == txOut.from);
      expectTrue(ethTx.to == txOut.to);
      expectTrue(ethTx.gas == txOut.gas);
      expectTrue(ethTx.gasPrice == txOut.gasPrice);
      expectTrue(ethTx.value == txOut.value);
      expectTrue(ethTx.chainId == txOut.chainId);
      expectTrue(ethTx.nonce == txOut.nonce);
      expectTrue(ethTx.data == txOut.data);
    });

    //
  });
}
