const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;


async function getContractInstance(organizationName) {
    
    var identityMaterial = getIdentityBasedOnOrganization(organizationName);
	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-OrganizationName.yaml
	gateway = new Gateway();
	
	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user USERS_ADMIN was initially added to this wallet.
	const wallet = new FileSystemWallet(identityMaterial.walletPath);
	
	// What is the username of this Client user accessing the network?
	const fabricUserName = identityMaterial.identityLabel;
	
	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.safeLoad(fs.readFileSync(identityMaterial.connectionProfilePath, 'utf8'));
	
	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};
	
	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);
	
	// Access property registration channel
	console.log('.....Connecting to channel - pharmachannel');
	const channel = await gateway.getNetwork('pharmachannel');
	
	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to regnet Smart Contract');
	return channel.getContract('pharmanet', 'org.pharma-network.pharmanet');
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

function getIdentityBasedOnOrganization(organization){
    var identityMaterial = {
        walletPath : "",
        identityLabel : "",
        connectionProfilePath: ""
    }
    if(organization == "Manufacturer"){
        identityMaterial.walletPath = './identity/manufacturer';
        identityMaterial.identityLabel = 'MANUFACTURER_ADMIN';
        identityMaterial.connectionProfilePath = './connection-profile-manufacturer.yaml';
    }
    else if(organization == "Distributor"){
        identityMaterial.walletPath = './identity/distributor';
        identityMaterial.identityLabel = 'DISTRIBUTOR_ADMIN';
        identityMaterial.connectionProfilePath = './connection-profile-distributor.yaml';
    }
    else if(organization == "Retailer"){
        identityMaterial.walletPath = './identity/retailer';
        identityMaterial.identityLabel = 'RETAILER_ADMIN';
        identityMaterial.connectionProfilePath = './connection-profile-retailer.yaml';
    }
    else if(organization == "Consumer"){
        identityMaterial.walletPath = './identity/consumer';
        identityMaterial.identityLabel = 'CONSUMER_ADMIN';
        identityMaterial.connectionProfilePath = './connection-profile-consumer.yaml';
    }
    else if(organization == "Transporter"){
        identityMaterial.walletPath = './identity/transporter';
        identityMaterial.identityLabel = 'TRANSPORTER_ADMIN';
        identityMaterial.connectionProfilePath = './connection-profile-transporter.yaml';
    }
    else{
        throw new Error("Invalid organization provided");
    }

    return identityMaterial;
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;