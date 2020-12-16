'use strict';

const helper = require('./contractHelper');

async function main(companyCRN, companyName, location, organizationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organizationRole);

		console.log('.....Requesting to create a New User on the Network');
		const newCompanyBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organizationRole);

		// process response
		console.log('.....Processing Approve New User Transaction Response \n\n');
		let newCompany = JSON.parse(newCompanyBuffer.toString());
		console.log(newCompany);
		console.log('\n\n.....Approve New User Transaction Complete!');
		return newCompany;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;
