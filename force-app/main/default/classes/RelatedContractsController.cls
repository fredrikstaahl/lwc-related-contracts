/**
 * Created by fredrikstahl on 2019-11-06.
 */

public with sharing class RelatedContractsController {

@TestVisible
private static String SOBJECT_NAME_ACCOUNT = 'Account';
@TestVisible
private static String SOBJECT_NAME_OPPORTUNITY = 'Opportunity';

@AuraEnabled (cacheable=true)
public static List<Contract> getRelatedContracts(Id recordId, String sObjectName) {
	Id accountId;
	Id parentAccountId;
	Id engagementAccountId;
	String registrationNo;

	if (sObjectName == SOBJECT_NAME_OPPORTUNITY) {
		Opportunity opp = [
			SELECT Id, AccountId, Account.ParentId
			FROM Opportunity
			WHERE Id = :recordId LIMIT 1
		];
		accountId = opp.AccountId;
		parentAccountId = opp.Account.ParentId;
	} else {
		Account acc = [
			SELECT Id, ParentId
			FROM Account
			WHERE Id = :recordId LIMIT 1
		];
		accountId = acc.Id;
		parentAccountId = acc.ParentId;
	}

	List<Contract> contractResult = [
		SELECT Id, StartDate, EndDate, Name, Account.Name
		FROM Contract
		WHERE AccountId = : accountId OR AccountId = : parentAccountId
	];
	return contractResult;
}

@AuraEnabled
public static void setContractOnOpportunity(String contractId, String opportunityId) {
	Opportunity thisOpportunity = [
		SELECT Id, ContractId
		FROM Opportunity
		WHERE Id = :opportunityId LIMIT 1
	];

	thisOpportunity.ContractId = contractId;
	update thisOpportunity;
}

@AuraEnabled
public static Id getContractIdForCurrentOpportunity(String opportunityId) {
	Opportunity thisOpportunity = [
		SELECT Id, ContractId
		FROM Opportunity
		WHERE Id = :opportunityId LIMIT 1
	];
	return thisOpportunity.ContractId;
}

}