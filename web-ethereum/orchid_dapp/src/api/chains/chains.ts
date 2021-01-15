import {GasFunds, LotFunds, TokenType} from "../orchid-eth-token-types";

export class EVMChains {
  public static ETHEREUM_MAIN_NET = 1
  public static ETH_TOKEN = new TokenType<GasFunds>(1, "Ethereum", "ETH", 18);
  public static OXT_TOKEN = new TokenType<LotFunds>(1, "Orchid Token", "OXT", 18);
  private static map: Map<number, ChainInfo> = new Map<number, ChainInfo>();

  private static ensureMapped() {
    if (EVMChains.map.size === 0) {
      chainid_data.forEach((json: ChainInfoJson) => {
        EVMChains.map.set(json.chainId, new ChainInfo(json));
      })
      // Add a description for ganache testing
      EVMChains.map.set(EVMChains.ganacheChain.chainId, new ChainInfo(EVMChains.ganacheChain));
    }
  }

  // Describe the chain for chain id
  public static getChain(id: number): ChainInfo | null {
    EVMChains.ensureMapped();
    return EVMChains.map.get(id) ?? null;
  }

  public static ganacheChain: ChainInfoJson = {
    name: "Ganache Test Chain",
    chainId: 1337,
    shortName: "Ganache",
    chain: "Ganache",
    network: "local test net",
    networkId: 1337,
    nativeCurrency: {
      name: "Ganache Token",
      symbol: "TOK",
      decimals: 18
    },
    rpc: [],
    faucets: [],
    infoURL: "",
  };
}

export class ChainInfo {
  name: string;
  chainId: number;
  gasToken: TokenType<GasFunds>;
  fundsToken: TokenType<LotFunds>;

  public get isEthereumMainNet(): boolean {
    return this.chainId === EVMChains.ETHEREUM_MAIN_NET
  }
  public get isGanache(): boolean {
    return this.chainId === 1337;
  }

  constructor(json: ChainInfoJson) {
    this.name = json.name;
    this.chainId = json.chainId;

    // TODO: Hard coded knowledge of contract version
    if (this.chainId === EVMChains.ETHEREUM_MAIN_NET) {
      // for main net assume the v0 contract
      this.gasToken = EVMChains.ETH_TOKEN;
      this.fundsToken = EVMChains.OXT_TOKEN;
    } else {
      // for other chains assume the v1 contract
      let token = json.nativeCurrency
      this.gasToken = new TokenType<GasFunds>(this.chainId, token.name, token.symbol, token.decimals);
      this.fundsToken = new TokenType<LotFunds>(this.chainId, token.name, token.symbol, token.decimals);
    }
  }
}

interface ChainTokenInfoJson {
  name: string;
  symbol: string;
  decimals: number;
}

interface ChainInfoJson {
  name: string;
  chainId: number;
  shortName: string;
  chain: string;
  network: string;
  networkId: number;
  nativeCurrency: ChainTokenInfoJson;
  rpc: string[];
  faucets: any[];
  infoURL: string;
}

//
// Chain data from https://chainid.network/chains.json
// https://github.com/ethereum-lists/chains
//
const chainid_data =
  [
    {
      "name": "Ethereum Mainnet",
      "chainId": 1,
      "shortName": "eth",
      "chain": "ETH",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "Ether", "symbol": "ETH", "decimals": 18},
      // eslint-disable-next-line no-template-curly-in-string
      "rpc": ["https://mainnet.infura.io/v3/${INFURA_API_KEY}", "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}", "https://api.mycryptoapi.com/eth", "https://cloudflare-eth.com"],
      "faucets": [],
      "infoURL": "https://ethereum.org"
    },
    {
      "name": "xDAI Chain",
      "chainId": 100,
      "shortName": "xdai",
      "chain": "XDAI",
      "network": "mainnet",
      "networkId": 100,
      "nativeCurrency": {"name": "xDAI", "symbol": "xDAI", "decimals": 18},
      "rpc": ["https://rpc.xdaichain.com", "https://xdai.poanetwork.dev", "wss://rpc.xdaichain.com/wss", "wss://xdai.poanetwork.dev/wss", "http://xdai.poanetwork.dev", "https://dai.poa.network", "ws://xdai.poanetwork.dev:8546"],
      "faucets": [],
      "infoURL": "https://forum.poa.network/c/xdai-chain"
    },
    {
      "name": "EtherInc",
      "chainId": 101,
      "shortName": "eti",
      "chain": "ETI",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "EtherInc Ether", "symbol": "ETI", "decimals": 18},
      "rpc": ["https://api.einc.io/jsonrpc/mainnet"],
      "faucets": [],
      "infoURL": "https://einc.io"
    },
    {
      "name": "ThunderCore Mainnet",
      "chainId": 108,
      "shortName": "TT",
      "chain": "TT",
      "network": "mainnet",
      "networkId": 108,
      "nativeCurrency": {"name": "ThunderCore Mainnet Ether", "symbol": "TT", "decimals": 18},
      "rpc": ["https://mainnet-rpc.thundercore.com"],
      "faucets": ["https://faucet.thundercore.com"],
      "infoURL": "https://thundercore.com"
    },
    {
      "name": "Metadium Mainnet",
      "chainId": 11,
      "shortName": "meta",
      "chain": "META",
      "network": "mainnet",
      "networkId": 11,
      "nativeCurrency": {"name": "Metadium Mainnet Ether", "symbol": "META", "decimals": 18},
      "rpc": ["https://api.metadium.com/prod"],
      "faucets": [],
      "infoURL": "https://metadium.com"
    },
    {
      "name": "IPOS Network",
      "chainId": 1122334455,
      "shortName": "ipos",
      "chain": "IPOS",
      "network": "mainnet",
      "networkId": 1122334455,
      "nativeCurrency": {"name": "IPOS Network Ether", "symbol": "IPOS", "decimals": 18},
      "rpc": ["https://rpc.iposlab.com", "https://rpc2.iposlab.com"],
      "faucets": [],
      "infoURL": "https://iposlab.com"
    },
    {
      "name": "MathChain",
      "chainId": 1139,
      "shortName": "MATH",
      "chain": "MATH",
      "network": "mainnet",
      "networkId": 1139,
      "nativeCurrency": {"name": "MathChain", "symbol": "MATH", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://mathwallet.org"
    },
    {
      "name": "MathChain Testnet",
      "chainId": 1140,
      "shortName": "tMATH",
      "chain": "MATH",
      "network": "testnet",
      "networkId": 1140,
      "nativeCurrency": {"name": "MathChain", "symbol": "MATH", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://mathwallet.org/"
    },
    {
      "name": "Metadium Testnet",
      "chainId": 12,
      "shortName": "kal",
      "chain": "META",
      "network": "testnet",
      "networkId": 12,
      "nativeCurrency": {"name": "Metadium Testnet Ether", "symbol": "KAL", "decimals": 18},
      "rpc": ["https://api.metadium.com/dev"],
      "faucets": [],
      "infoURL": "https://metadium.com"
    },
    {
      "name": "Fuse Mainnet",
      "chainId": 122,
      "shortName": "fuse",
      "chain": "FUSE",
      "network": "mainnet",
      "networkId": 122,
      "nativeCurrency": {"name": "Fuse", "symbol": "FUSE", "decimals": 18},
      "rpc": ["https://rpc.fuse.io"],
      "faucets": [],
      "infoURL": "https://fuse.io/"
    },
    {
      "name": "Diode Testnet Staging",
      "chainId": 13,
      "shortName": "dstg",
      "chain": "DIO",
      "network": "testnet",
      "networkId": 13,
      "nativeCurrency": {"name": "Staging Diodes", "symbol": "sDIO", "decimals": 18},
      "rpc": ["https://staging.diode.io:8443/", "wss://staging.diode.io:8443/ws"],
      "faucets": [],
      "infoURL": "https://diode.io/staging"
    },
    {
      "name": "Ether-1",
      "chainId": 1313114,
      "shortName": "etho",
      "chain": "ETHO",
      "network": "mainnet",
      "networkId": 1313114,
      "nativeCurrency": {"name": "Ether-1 Ether", "symbol": "ETHO", "decimals": 18},
      "rpc": ["https://rpc.ether1.org"],
      "faucets": [],
      "infoURL": "https://ether1.org"
    },
    {
      "name": "NEAR MainNet",
      "chainId": 1313161554,
      "shortName": "near",
      "chain": "NEAR",
      "network": "mainnet",
      "networkId": 1313161554,
      "nativeCurrency": {"name": "NEAR", "symbol": "NEAR", "decimals": 24},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://near.org/"
    },
    {
      "name": "NEAR TestNet",
      "chainId": 1313161555,
      "shortName": "neart",
      "chain": "NEAR",
      "network": "testnet",
      "networkId": 1313161555,
      "nativeCurrency": {"name": "NEAR", "symbol": "tNEAR", "decimals": 24},
      "rpc": [],
      "faucets": ["https://wallet.testnet.near.org"],
      "infoURL": "https://near.org/"
    },
    {
      "name": "Xerom",
      "chainId": 1313500,
      "shortName": "xero",
      "chain": "XERO",
      "network": "mainnet",
      "networkId": 1313500,
      "nativeCurrency": {"name": "Xerom Ether", "symbol": "XERO", "decimals": 18},
      "rpc": ["https://rpc.xerom.org"],
      "faucets": [],
      "infoURL": "https://xerom.org"
    },
    {
      "name": "PepChain Churchill",
      "chainId": 13371337,
      "shortName": "tpep",
      "chain": "PEP",
      "network": "testnet",
      "networkId": 13371337,
      "nativeCurrency": {"name": "PepChain Churchill Ether", "symbol": "TPEP", "decimals": 18},
      "rpc": ["https://churchill-rpc.pepchain.io"],
      "faucets": [],
      "infoURL": "https://pepchain.io"
    },
    {
      "name": "Matic Mainnet",
      "chainId": 137,
      "shortName": "matic",
      "chain": "Matic",
      "network": "mainnet",
      "networkId": 137,
      "nativeCurrency": {"name": "Matic", "symbol": "MATIC", "decimals": 18},
      "rpc": ["https://rpc-mainnet.matic.network", "wss://ws-mainnet.matic.network"],
      "faucets": [],
      "infoURL": "https://matic.network/"
    },
    {
      "name": "Diode Prenet",
      "chainId": 15,
      "shortName": "dio",
      "chain": "DIO",
      "network": "mainnet",
      "networkId": 15,
      "nativeCurrency": {"name": "Diodes", "symbol": "DIO", "decimals": 18},
      "rpc": ["https://prenet.diode.io:8443/", "wss://prenet.diode.io:8443/ws"],
      "faucets": [],
      "infoURL": "https://diode.io/prenet"
    },
    {
      "name": "Lightstreams Testnet",
      "chainId": 162,
      "shortName": "tpht",
      "chain": "PHT",
      "network": "sirius",
      "networkId": 162,
      "nativeCurrency": {"name": "Lightstreams PHT", "symbol": "PHT", "decimals": 18},
      "rpc": ["https://node.sirius.lightstreams.io"],
      "faucets": ["https://discuss.lightstreams.network/t/request-test-tokens"],
      "infoURL": "https://explorer.sirius.lightstreams.io"
    },
    {
      "name": "Atheios",
      "chainId": 1620,
      "shortName": "ath",
      "chain": "ATH",
      "network": "mainnet",
      "networkId": 11235813,
      "nativeCurrency": {"name": "Atheios Ether", "symbol": "ATH", "decimals": 18},
      "rpc": ["https://wallet.atheios.com:8797"],
      "faucets": [],
      "infoURL": "https://atheios.com"
    },
    {
      "name": "Lightstreams Mainnet",
      "chainId": 163,
      "shortName": "pht",
      "chain": "PHT",
      "network": "mainnet",
      "networkId": 163,
      "nativeCurrency": {"name": "Lightstreams PHT", "symbol": "PHT", "decimals": 18},
      "rpc": ["https://node.mainnet.lightstreams.io"],
      "faucets": [],
      "infoURL": "https://explorer.lightstreams.io"
    },
    {
      "name": "ThunderCore Testnet",
      "chainId": 18,
      "shortName": "TST",
      "chain": "TST",
      "network": "testnet",
      "networkId": 18,
      "nativeCurrency": {"name": "ThunderCore Testnet Ether", "symbol": "TST", "decimals": 18},
      "rpc": ["https://testnet-rpc.thundercore.com"],
      "faucets": ["https://faucet-testnet.thundercore.com"],
      "infoURL": "https://thundercore.com"
    },
    {
      "name": "IOLite",
      "chainId": 18289463,
      "shortName": "ilt",
      "chain": "ILT",
      "network": "mainnet",
      "networkId": 18289463,
      "nativeCurrency": {"name": "IOLite Ether", "symbol": "ILT", "decimals": 18},
      "rpc": ["https://net.iolite.io"],
      "faucets": [],
      "infoURL": "https://iolite.io"
    },
    {
      "name": "Teslafunds",
      "chainId": 1856,
      "shortName": "tsf",
      "chain": "TSF",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "Teslafunds Ether", "symbol": "TSF", "decimals": 18},
      "rpc": ["https://tsfapi.europool.me"],
      "faucets": [],
      "infoURL": "https://teslafunds.io"
    },
    {
      "name": "EtherGem",
      "chainId": 1987,
      "shortName": "egem",
      "chain": "EGEM",
      "network": "mainnet",
      "networkId": 1987,
      "nativeCurrency": {"name": "EtherGem Ether", "symbol": "EGEM", "decimals": 18},
      "rpc": ["https://jsonrpc.egem.io/custom"],
      "faucets": [],
      "infoURL": "https://egem.io"
    },
    {
      "name": "Expanse Network",
      "chainId": 2,
      "shortName": "exp",
      "chain": "EXP",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "Expanse Network Ether", "symbol": "EXP", "decimals": 18},
      "rpc": ["https://node.expanse.tech"],
      "faucets": [],
      "infoURL": "https://expanse.tech"
    },
    {
      "name": "ELA-ETH-Sidechain Mainnet",
      "chainId": 20,
      "shortName": "elaeth",
      "chain": "ETH",
      "network": "mainnet",
      "networkId": 20,
      "nativeCurrency": {"name": "Elastos", "symbol": "ELA", "decimals": 18},
      "rpc": ["https://mainrpc.elaeth.io"],
      "faucets": [],
      "infoURL": "https://www.elastos.org/"
    },
    {
      "name": "Akroma",
      "chainId": 200625,
      "shortName": "aka",
      "chain": "AKA",
      "network": "mainnet",
      "networkId": 200625,
      "nativeCurrency": {"name": "Akroma Ether", "symbol": "AKA", "decimals": 18},
      "rpc": ["https://remote.akroma.io"],
      "faucets": [],
      "infoURL": "https://akroma.io"
    },
    {
      "name": "ELA-ETH-Sidechain Testnet",
      "chainId": 21,
      "shortName": "elaetht",
      "chain": "ETH",
      "network": "testnet",
      "networkId": 21,
      "nativeCurrency": {"name": "Elastos", "symbol": "tELA", "decimals": 18},
      "rpc": ["https://rpc.elaeth.io"],
      "faucets": ["https://faucet.elaeth.io/"],
      "infoURL": "https://elaeth.io/"
    },
    {
      "name": "Freight Trust Network",
      "chainId": 211,
      "shortName": "EDI",
      "chain": "EDI",
      "network": "freight & trade network",
      "networkId": 0,
      "nativeCurrency": {"name": "Freight Trust Native", "symbol": "0xF", "decimals": 18},
      // eslint-disable-next-line no-template-curly-in-string
      "rpc": ["http://13.57.207.168:3435", "https://app.freighttrust.net/ftn/${API_KEY}"],
      "faucets": ["http://faucet.freight.sh"],
      "infoURL": "https://freighttrust.com"
    },
    {
      "name": "Webchain",
      "chainId": 24484,
      "shortName": "web",
      "chain": "WEB",
      "network": "mainnet",
      "networkId": 37129,
      "nativeCurrency": {"name": "Webchain Ether", "symbol": "WEB", "decimals": 18},
      "rpc": ["https://node1.webchain.network"],
      "faucets": [],
      "infoURL": "https://webchain.network"
    },
    {
      "name": "Energy Web Chain",
      "chainId": 246,
      "shortName": "ewt",
      "chain": "Energy Web Chain",
      "network": "mainnet",
      "networkId": 246,
      "nativeCurrency": {"name": "Energy Web Token", "symbol": "EWT", "decimals": 18},
      "rpc": ["https://rpc.energyweb.org", "wss://rpc.energyweb.org/ws"],
      "faucets": [],
      "infoURL": "https://energyweb.org"
    },
    {
      "name": "ARTIS sigma1",
      "chainId": 246529,
      "shortName": "ats",
      "chain": "ARTIS",
      "network": "sigma1",
      "networkId": 246529,
      "nativeCurrency": {"name": "ARTIS sigma1 Ether", "symbol": "ATS", "decimals": 18},
      "rpc": ["https://rpc.sigma1.artis.network"],
      "faucets": [],
      "infoURL": "https://artis.eco"
    },
    {
      "name": "ARTIS Testnet tau1",
      "chainId": 246785,
      "shortName": "atstau",
      "chain": "ARTIS",
      "network": "tau1",
      "networkId": 246785,
      "nativeCurrency": {"name": "ARTIS tau1 Ether", "symbol": "tATS", "decimals": 18},
      "rpc": ["https://rpc.tau1.artis.network"],
      "faucets": [],
      "infoURL": "https://artis.network"
    },
    {
      "name": "Fantom Opera",
      "chainId": 250,
      "shortName": "ftm",
      "chain": "FTM",
      "network": "mainnet",
      "networkId": 250,
      "nativeCurrency": {"name": "Fantom", "symbol": "FTM", "decimals": 18},
      "rpc": ["https://rpc.fantom.network", "https://fantomscan.io/rpc"],
      "faucets": [],
      "infoURL": "https://fantom.foundation"
    },
    {
      "name": "High Performance Blockchain",
      "chainId": 269,
      "shortName": "hpb",
      "chain": "HPB",
      "network": "mainnet",
      "networkId": 100,
      "nativeCurrency": {
        "name": "High Performance Blockchain Ether",
        "symbol": "HPB",
        "decimals": 18
      },
      "rpc": ["https://node.hpb.blue"],
      "faucets": [],
      "infoURL": "https://hpb.io"
    },
    {
      "name": "Auxilium Network Mainnet",
      "chainId": 28945486,
      "shortName": "auxi",
      "chain": "AUX",
      "network": "mainnet",
      "networkId": 28945486,
      "nativeCurrency": {"name": "Auxilium coin", "symbol": "AUX", "decimals": 18},
      "rpc": ["https://rpc.auxilium.global"],
      "faucets": [],
      "infoURL": "https://auxilium.global"
    },
    {
      "name": "Ethereum Testnet Ropsten",
      "chainId": 3,
      "shortName": "rop",
      "chain": "ETH",
      "network": "ropsten",
      "networkId": 3,
      "nativeCurrency": {"name": "Ropsten Ether", "symbol": "ROP", "decimals": 18},
      // eslint-disable-next-line no-template-curly-in-string
      "rpc": ["https://ropsten.infura.io/v3/${INFURA_API_KEY}", "wss://ropsten.infura.io/ws/v3/${INFURA_API_KEY}"],
      // eslint-disable-next-line no-template-curly-in-string
      "faucets": ["https://faucet.ropsten.be?${ADDRESS}"],
      "infoURL": "https://github.com/ethereum/ropsten"
    },
    {
      "name": "RSK Mainnet",
      "chainId": 30,
      "shortName": "rsk",
      "chain": "RSK",
      "network": "mainnet",
      "networkId": 30,
      "nativeCurrency": {"name": "RSK Mainnet Ether", "symbol": "RBTC", "decimals": 18},
      "rpc": ["https://public-node.rsk.co", "https://mycrypto.rsk.co"],
      "faucets": [],
      "infoURL": "https://rsk.co"
    },
    {
      "name": "RSK Testnet",
      "chainId": 31,
      "shortName": "trsk",
      "chain": "RSK",
      "network": "testnet",
      "networkId": 31,
      "nativeCurrency": {"name": "RSK Testnet Ether", "symbol": "tRBTC", "decimals": 18},
      "rpc": ["https://public-node.testnet.rsk.co", "https://mycrypto.testnet.rsk.co"],
      "faucets": ["https://faucet.testnet.rsk.co"],
      "infoURL": "https://rsk.co"
    },
    {
      "name": "Ethersocial Network",
      "chainId": 31102,
      "shortName": "esn",
      "chain": "ESN",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "Ethersocial Network Ether", "symbol": "ESN", "decimals": 18},
      "rpc": ["https://api.esn.gonspool.com"],
      "faucets": [],
      "infoURL": "https://ethersocial.org"
    },
    {
      "name": "Pirl",
      "chainId": 3125659152,
      "shortName": "pirl",
      "chain": "PIRL",
      "network": "mainnet",
      "networkId": 3125659152,
      "nativeCurrency": {"name": "Pirl Ether", "symbol": "PIRL", "decimals": 18},
      "rpc": ["https://wallrpc.pirl.io"],
      "faucets": [],
      "infoURL": "https://pirl.io"
    },
    {
      "name": "Joys Digital Mainnet",
      "chainId": 35855456,
      "shortName": "JOYS",
      "chain": "JOYS",
      "network": "mainnet",
      "networkId": 35855456,
      "nativeCurrency": {"name": "JOYS", "symbol": "JOYS", "decimals": 18},
      "rpc": ["https://node.joys.digital"],
      "faucets": [],
      "infoURL": "https://joys.digital"
    },
    {
      "name": "Valorbit",
      "chainId": 38,
      "shortName": "val",
      "chain": "VAL",
      "network": "mainnet",
      "networkId": 38,
      "nativeCurrency": {"name": "Valorbit", "symbol": "VAL", "decimals": 18},
      "rpc": ["https://rpc.valorbit.com/v2"],
      "faucets": [],
      "infoURL": "https://valorbit.com"
    },
    {
      "name": "Lisinski",
      "chainId": 385,
      "shortName": "lisinski",
      "chain": "CRO",
      "network": "mainnet",
      "networkId": 385,
      "nativeCurrency": {"name": "Lisinski Ether", "symbol": "LISINSKI", "decimals": 18},
      "rpc": ["https://rpc-bitfalls1.lisinski.online"],
      "faucets": ["https://pipa.lisinski.online"],
      "infoURL": "https://lisinski.online"
    },
    {
      "name": "Energi Mainnet",
      "chainId": 39797,
      "shortName": "nrg",
      "chain": "NRG",
      "network": "mainnet",
      "networkId": 39797,
      "nativeCurrency": {"name": "Energi", "symbol": "NRG", "decimals": 18},
      "rpc": ["https://nodeapi.gen3.energi.network"],
      "faucets": [],
      "infoURL": "https://www.energi.world/"
    },
    {
      "name": "Ethereum Testnet Rinkeby",
      "chainId": 4,
      "shortName": "rin",
      "chain": "ETH",
      "network": "rinkeby",
      "networkId": 4,
      "nativeCurrency": {"name": "Rinkeby Ether", "symbol": "RIN", "decimals": 18},
      // eslint-disable-next-line no-template-curly-in-string
      "rpc": ["https://rinkeby.infura.io/v3/${INFURA_API_KEY}", "wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}"],
      "faucets": ["https://faucet.rinkeby.io"],
      "infoURL": "https://www.rinkeby.io"
    },
    {
      "name": "Ethereum Testnet Kovan",
      "chainId": 42,
      "shortName": "kov",
      "chain": "ETH",
      "network": "kovan",
      "networkId": 42,
      "nativeCurrency": {"name": "Kovan Ether", "symbol": "KOV", "decimals": 18},
      // eslint-disable-next-line no-template-curly-in-string
      "rpc": ["https://kovan.poa.network", "http://kovan.poa.network:8545", "https://kovan.infura.io/v3/${INFURA_API_KEY}", "wss://kovan.infura.io/ws/v3/${INFURA_API_KEY}", "ws://kovan.poa.network:8546"],
      "faucets": ["https://faucet.kovan.network", "https://gitter.im/kovan-testnet/faucet"],
      "infoURL": "https://kovan-testnet.github.io/website"
    },
    {
      "name": "Optimistic Ethereum",
      "chainId": 420,
      "shortName": "oeth",
      "chain": "ETH",
      "network": "mainnet",
      "networkId": 420,
      "nativeCurrency": {"name": "Ether", "symbol": "OETH", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://optimism.io"
    },
    {
      "name": "Athereum",
      "chainId": 43110,
      "shortName": "avaeth",
      "chain": "ATH",
      "network": "athereum",
      "networkId": 43110,
      "nativeCurrency": {"name": "Athereum Ether", "symbol": "ATH", "decimals": 18},
      "rpc": ["https://ava.network:21015/ext/evm/rpc"],
      // eslint-disable-next-line no-template-curly-in-string
      "faucets": ["http://athfaucet.ava.network//?address=${ADDRESS}"],
      "infoURL": "https://athereum.ava.network"
    },
    {
      "name": "Energi Testnet",
      "chainId": 49797,
      "shortName": "tnrg",
      "chain": "NRG",
      "network": "testnet",
      "networkId": 49797,
      "nativeCurrency": {"name": "Energi", "symbol": "tNRG", "decimals": 18},
      "rpc": ["https://nodeapi.test3.energi.network"],
      "faucets": [],
      "infoURL": "https://www.energi.world/"
    },
    {
      "name": "Ethereum Testnet Görli",
      "chainId": 5,
      "shortName": "gor",
      "chain": "ETH",
      "network": "goerli",
      "networkId": 5,
      "nativeCurrency": {"name": "Görli Ether", "symbol": "GOR", "decimals": 18},
      "rpc": ["https://rpc.goerli.mudit.blog/", "https://rpc.slock.it/goerli ", "https://goerli.prylabs.net/"],
      // eslint-disable-next-line no-template-curly-in-string
      "faucets": ["https://goerli-faucet.slock.it/?address=${ADDRESS}", "https://faucet.goerli.mudit.blog"],
      "infoURL": "https://goerli.net/#about"
    },
    {
      "name": "Tao Network",
      "chainId": 558,
      "shortName": "tao",
      "chain": "TAO",
      "network": "core",
      "networkId": 558,
      "nativeCurrency": {"name": "Tao", "symbol": "TAO", "decimals": 18},
      "rpc": ["https://rpc.testnet.tao.network", "http://rpc.testnet.tao.network:8545", "https://rpc.tao.network", "wss://rpc.tao.network"],
      "faucets": [],
      "infoURL": "https://tao.network"
    },
    {
      "name": "Binance Smart Chain Mainnet",
      "chainId": 56,
      "shortName": "bnb",
      "chain": "BSC",
      "network": "mainnet",
      "networkId": 56,
      "nativeCurrency": {"name": "Binance Chain Native Token", "symbol": "BNB", "decimals": 18},
      "rpc": ["https://bsc-dataseed1.binance.org", "https://bsc-dataseed2.binance.org", "https://bsc-dataseed3.binance.org", "https://bsc-dataseed4.binance.org", "https://bsc-dataseed1.defibit.io", "https://bsc-dataseed2.defibit.io", "https://bsc-dataseed3.defibit.io", "https://bsc-dataseed4.defibit.io", "https://bsc-dataseed1.ninicoin.io", "https://bsc-dataseed2.ninicoin.io", "https://bsc-dataseed3.ninicoin.io", "https://bsc-dataseed4.ninicoin.io", "wss://bsc-ws-node.nariox.org"],
      "faucets": [],
      "infoURL": "https://www.binance.org"
    },
    {
      "name": "Wegochain Rubidium Mainnet",
      "chainId": 5869,
      "shortName": "rbd",
      "chain": "RBD",
      "network": "mainnet",
      "networkId": 5869,
      "nativeCurrency": {"name": "Rubid", "symbol": "RBD", "decimals": 18},
      "rpc": ["https://proxy.wegochain.io", "http://wallet.wegochain.io:7764"],
      "faucets": [],
      "infoURL": "http://wegochain.io"
    },
    {
      "name": "Acala Mandala Testnet",
      "chainId": 595,
      "shortName": "maca",
      "chain": "mACA",
      "network": "testnet",
      "networkId": 595,
      "nativeCurrency": {"name": "Acala Mandala Token", "symbol": "mACA", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://acala.network"
    },
    {
      "name": "Ethereum Classic Testnet Kotti",
      "chainId": 6,
      "shortName": "kot",
      "chain": "ETC",
      "network": "kotti",
      "networkId": 6,
      "nativeCurrency": {"name": "Kotti Ether", "symbol": "KOT", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://explorer.jade.builders/?network=kotti"
    },
    {
      "name": "GoChain",
      "chainId": 60,
      "shortName": "go",
      "chain": "GO",
      "network": "mainnet",
      "networkId": 60,
      "nativeCurrency": {"name": "GoChain Ether", "symbol": "GO", "decimals": 18},
      "rpc": ["https://rpc.gochain.io"],
      "faucets": [],
      "infoURL": "https://gochain.io"
    },
    {
      "name": "Ethereum Classic Mainnet",
      "chainId": 61,
      "shortName": "etc",
      "chain": "ETC",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "Ethereum Classic Ether", "symbol": "ETC", "decimals": 18},
      "rpc": ["https://ethereumclassic.network"],
      "faucets": [],
      "infoURL": "https://ethereumclassic.org"
    },
    {
      "name": "Aquachain",
      "chainId": 61717561,
      "shortName": "aqua",
      "chain": "AQUA",
      "network": "mainnet",
      "networkId": 61717561,
      "nativeCurrency": {"name": "Aquachain Ether", "symbol": "AQUA", "decimals": 18},
      "rpc": ["https://c.onical.org", "https://tx.aquacha.in/api"],
      "faucets": ["https://aquacha.in/faucet"],
      "infoURL": "https://aquachain.github.io"
    },
    {
      "name": "Ethereum Classic Testnet Morden",
      "chainId": 62,
      "shortName": "tetc",
      "chain": "ETC",
      "network": "testnet",
      "networkId": 2,
      "nativeCurrency": {
        "name": "Ethereum Classic Testnet Ether",
        "symbol": "TETC",
        "decimals": 18
      },
      "rpc": [],
      "faucets": [],
      "infoURL": "https://ethereumclassic.org"
    },
    {
      "name": "Ethereum Classic Testnet Mordor",
      "chainId": 63,
      "shortName": "metc",
      "chain": "ETC",
      "network": "testnet",
      "networkId": 7,
      "nativeCurrency": {"name": "Mordor Classic Testnet Ether", "symbol": "METC", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://github.com/eth-classic/mordor/"
    },
    {
      "name": "Ellaism",
      "chainId": 64,
      "shortName": "ella",
      "chain": "ELLA",
      "network": "mainnet",
      "networkId": 64,
      "nativeCurrency": {"name": "Ellaism Ether", "symbol": "ELLA", "decimals": 18},
      "rpc": ["https://jsonrpc.ellaism.org"],
      "faucets": [],
      "infoURL": "https://ellaism.org"
    },
    {
      "name": "DBChain Testnet",
      "chainId": 67,
      "shortName": "dbm",
      "chain": "DBM",
      "network": "testnet",
      "networkId": 67,
      "nativeCurrency": {"name": "DBChain Testnet", "symbol": "DBM", "decimals": 18},
      "rpc": ["http://test-rpc.dbmbp.com"],
      "faucets": [],
      "infoURL": "http://test.dbmbp.com"
    },
    {
      "name": "Karura Network",
      "chainId": 686,
      "shortName": "kar",
      "chain": "KAR",
      "network": "mainnet",
      "networkId": 686,
      "nativeCurrency": {"name": "Karura Token", "symbol": "KAR", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://karura.network"
    },
    {
      "name": "ThaiChain",
      "chainId": 7,
      "shortName": "tch",
      "chain": "TCH",
      "network": "mainnet",
      "networkId": 7,
      "nativeCurrency": {"name": "ThaiChain Ether", "symbol": "TCH", "decimals": 18},
      "rpc": ["https://rpc.dome.cloud"],
      "faucets": [],
      "infoURL": "https://thaichain.io"
    },
    {
      "name": "Energy Web Volta Testnet",
      "chainId": 73799,
      "shortName": "vt",
      "chain": "Volta",
      "network": "testnet",
      "networkId": 73799,
      "nativeCurrency": {"name": "Volta Token", "symbol": "VT", "decimals": 18},
      "rpc": ["https://volta-rpc.energyweb.org", "wss://volta-rpc.energyweb.org/ws"],
      "faucets": ["https://voltafaucet.energyweb.org"],
      "infoURL": "https://energyweb.org"
    },
    {
      "name": "Mix",
      "chainId": 76,
      "shortName": "mix",
      "chain": "MIX",
      "network": "mainnet",
      "networkId": 76,
      "nativeCurrency": {"name": "Mix Ether", "symbol": "MIX", "decimals": 18},
      "rpc": ["https://rpc2.mix-blockchain.org:8647"],
      "faucets": [],
      "infoURL": "https://mix-blockchain.org"
    },
    {
      "name": "POA Network Sokol",
      "chainId": 77,
      "shortName": "poa",
      "chain": "POA",
      "network": "sokol",
      "networkId": 77,
      "nativeCurrency": {"name": "POA Sokol Ether", "symbol": "POA", "decimals": 18},
      "rpc": ["https://sokol.poa.network", "wss://sokol.poa.network/wss", "ws://sokol.poa.network:8546"],
      "faucets": ["https://faucet-sokol.herokuapp.com"],
      "infoURL": "https://poa.network"
    },
    {
      "name": "Musicoin",
      "chainId": 7762959,
      "shortName": "music",
      "chain": "MUSIC",
      "network": "mainnet",
      "networkId": 7762959,
      "nativeCurrency": {"name": "Musicoin", "symbol": "MUSIC", "decimals": 18},
      "rpc": ["https://mewapi.musicoin.tw"],
      "faucets": [],
      "infoURL": "https://musicoin.tw"
    },
    {
      "name": "Firenze test network",
      "chainId": 78110,
      "shortName": "firenze",
      "chain": "ETH",
      "network": "testnet",
      "networkId": 78110,
      "nativeCurrency": {"name": "Firenze Ether", "symbol": "FIN", "decimals": 18},
      "rpc": ["https://ethnode.primusmoney.com/firenze"],
      "faucets": [],
      "infoURL": "https://primusmoney.com"
    },
    {
      "name": "Acala Network",
      "chainId": 787,
      "shortName": "aca",
      "chain": "ACA",
      "network": "mainnet",
      "networkId": 787,
      "nativeCurrency": {"name": "Acala Token", "symbol": "ACA", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://acala.network"
    },
    {
      "name": "Ubiq Network Mainnet",
      "chainId": 8,
      "shortName": "ubq",
      "chain": "UBQ",
      "network": "mainnet",
      "networkId": 88,
      "nativeCurrency": {"name": "Ubiq Ether", "symbol": "UBQ", "decimals": 18},
      "rpc": ["https://rpc.octano.dev", "https://pyrus2.ubiqscan.io"],
      "faucets": [],
      "infoURL": "https://ubiqsmart.com"
    },
    {
      "name": "Matic Testnet Mumbai",
      "chainId": 80001,
      "shortName": "maticmum",
      "chain": "Matic",
      "network": "testnet",
      "networkId": 80001,
      "nativeCurrency": {"name": "Matic", "symbol": "tMATIC", "decimals": 18},
      "rpc": ["https://rpc-mumbai.matic.today", "wss://ws-mumbai.matic.today"],
      "faucets": ["https://faucet.matic.network/"],
      "infoURL": "https://matic.network/"
    },
    {
      "name": "Meter Mainnet",
      "chainId": 82,
      "shortName": "Meter",
      "chain": "METER",
      "network": "mainnet",
      "networkId": 82,
      "nativeCurrency": {"name": "Meter", "symbol": "MTR", "decimals": 18},
      "rpc": ["https://rpc.meter.io"],
      "faucets": [],
      "infoURL": "https://www.meter.io"
    },
    {
      "name": "Callisto Mainnet",
      "chainId": 820,
      "shortName": "clo",
      "chain": "CLO",
      "network": "mainnet",
      "networkId": 1,
      "nativeCurrency": {"name": "Callisto Mainnet Ether", "symbol": "CLO", "decimals": 18},
      "rpc": ["https://clo-geth.0xinfra.com"],
      "faucets": [],
      "infoURL": "https://callisto.network"
    },
    {
      "name": "Callisto Testnet",
      "chainId": 821,
      "shortName": "tclo",
      "chain": "CLO",
      "network": "testnet",
      "networkId": 2,
      "nativeCurrency": {"name": "Callisto Testnet Ether", "symbol": "TCLO", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://callisto.network"
    },
    {
      "name": "TomoChain",
      "chainId": 88,
      "shortName": "tomo",
      "chain": "TOMO",
      "network": "mainnet",
      "networkId": 88,
      "nativeCurrency": {"name": "TomoChain Ether", "symbol": "TOMO", "decimals": 18},
      "rpc": ["https://core.tomocoin.io"],
      "faucets": [],
      "infoURL": "https://tomocoin.io"
    },
    {
      "name": "bloxberg",
      "chainId": 8995,
      "shortName": "berg",
      "chain": "bloxberg",
      "network": "mainnet",
      "networkId": 8995,
      "nativeCurrency": {"name": "BERG", "symbol": "U+25B3", "decimals": 18},
      "rpc": ["https://core.bloxberg.org"],
      "faucets": ["https://faucet.bloxberg.org/"],
      "infoURL": "https://bloxberg.org"
    },
    {
      "name": "Ubiq Network Testnet",
      "chainId": 9,
      "shortName": "tubq",
      "chain": "UBQ",
      "network": "mainnet",
      "networkId": 2,
      "nativeCurrency": {"name": "Ubiq Testnet Ether", "symbol": "TUBQ", "decimals": 18},
      "rpc": [],
      "faucets": [],
      "infoURL": "https://ethersocial.org"
    },
    {
      "name": "Binance Smart Chain Testnet",
      "chainId": 97,
      "shortName": "bnbt",
      "chain": "BSC",
      "network": "Chapel",
      "networkId": 97,
      "nativeCurrency": {"name": "Binance Chain Native Token", "symbol": "tBNB", "decimals": 18},
      "rpc": ["https://data-seed-prebsc-1-s1.binance.org:8545", "https://data-seed-prebsc-2-s1.binance.org:8545", "https://data-seed-prebsc-1-s2.binance.org:8545", "https://data-seed-prebsc-2-s2.binance.org:8545", "https://data-seed-prebsc-1-s3.binance.org:8545", "https://data-seed-prebsc-2-s3.binance.org:8545"],
      "faucets": ["https://testnet.binance.org/faucet-smart"],
      "infoURL": "https://testnet.binance.org/"
    },
    {
      "name": "Nepal Blockchain Network",
      "chainId": 977,
      "shortName": "yeti",
      "chain": "YETI",
      "network": "mainnet",
      "networkId": 977,
      "nativeCurrency": {
        "name": "Nepal Blockchain Network Ether",
        "symbol": "YETI",
        "decimals": 18
      },
      "rpc": ["https://api.nepalblockchain.dev", "https://api.nepalblockchain.network"],
      "faucets": ["https://faucet.nepalblockchain.network"],
      "infoURL": "https://nepalblockchain.network"
    },
    {
      "name": "POA Network Core",
      "chainId": 99,
      "shortName": "skl",
      "chain": "POA",
      "network": "core",
      "networkId": 99,
      "nativeCurrency": {"name": "POA Network Core Ether", "symbol": "SKL", "decimals": 18},
      "rpc": ["https://core.poanetwork.dev", "http://core.poanetwork.dev:8545", "https://core.poa.network", "ws://core.poanetwork.dev:8546"],
      "faucets": [],
      "infoURL": "https://poa.network"
    },
    {
      "name": "Joys Digital TestNet",
      "chainId": 99415706,
      "shortName": "TOYS",
      "chain": "TOYS",
      "network": "testnet",
      "networkId": 99415706,
      "nativeCurrency": {"name": "TOYS", "symbol": "TOYS", "decimals": 18},
      "rpc": ["https://toys.joys.cash/"],
      "faucets": ["https://faucet.joys.digital/"],
      "infoURL": "https://joys.digital"
    }
  ];

