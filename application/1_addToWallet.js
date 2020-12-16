'use strict';

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

async function main(certificatePath, privateKeyPath,organization) {

    var identityMaterial = getIdentityBasedOnOrganization(organization);

    var wallet = new FileSystemWallet(identityMaterial.walletPath);
	// Main try/catch block
	try {

		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = identityMaterial.identityLabel;
		const identity = X509WalletMixin.createIdentity(identityMaterial.msp, certificate, privatekey);

		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}


function getIdentityBasedOnOrganization(organization){
    var identityMaterial = {
        walletPath : "",
        identityLabel : "",
        msp: ""
    }
    if(organization == "Manufacturer"){
        identityMaterial.walletPath = './identity/manufacturer';
        identityMaterial.identityLabel = 'MANUFACTURER_ADMIN';
        identityMaterial.msp = 'manufacturerMSP';
    }
    else if(organization == "Distributor"){
        identityMaterial.walletPath = './identity/distributor';
        identityMaterial.identityLabel = 'DISTRIBUTOR_ADMIN';
        identityMaterial.msp = 'distributorMSP';
    }
    else if(organization == "Retailer"){
        identityMaterial.walletPath = './identity/retailer';
        identityMaterial.identityLabel = 'RETAILER_ADMIN';
        identityMaterial.msp = 'retailerMSP';
    }
    else if(organization == "Consumer"){
        identityMaterial.walletPath = './identity/consumer';
        identityMaterial.identityLabel = 'CONSUMER_ADMIN';
        identityMaterial.msp = 'consumerMSP';
    }
    else if(organization == "Transporter"){
        identityMaterial.walletPath = './identity/transporter';
        identityMaterial.identityLabel = 'TRANSPORTER_ADMIN';
        identityMaterial.msp = 'transporterMSP';
    }
    else{
        throw new Error("Invalid organization provided");
    }

    return identityMaterial;
}

/*main(
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem',
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/5b5a4322c2f066ca9f5dbdc61cca31fb77ed64d3e037228cc6ca22bd30a9ad9a_sk',
    'Manufacturer')
 .then(() => {
  console.log('User identity added to wallet.');
});*/

/*main(
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem',
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/3cf23a081ae625946adc73e405e41bfa5ed6448c54f894810c56f09be4efecee_sk',
    'Distributor')
 .then(() => {
  console.log('User identity added to wallet.');
});*/

/*main(
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/signcerts/Admin@retailer.pharma-network.com-cert.pem',
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/keystore/92b165fdf14c5e4b1ce0f95e846292d8fd015a60e0d99f13a37da7c94cf11173_sk',
    'Retailer')
 .then(() => {
  console.log('User identity added to wallet.');
});*/

/*main(
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/signcerts/Admin@consumer.pharma-network.com-cert.pem',
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/keystore/f224df801e2fd621d9adafb3a8319eb50cb5bb3ddacb753f02f37898612b026b_sk',
    'Consumer')
 .then(() => {
  console.log('User identity added to wallet.');
});*/

/*main(
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem',
    '/home/aishwary/workspace/pharmachain/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/31d6d5e1619845c174c9868589027e319e44625f9909d3f9efebdf7728fc6e5a_sk',
    'Transporter')
 .then(() => {
  console.log('User identity added to wallet.');
});*/

module.exports.execute = main;
