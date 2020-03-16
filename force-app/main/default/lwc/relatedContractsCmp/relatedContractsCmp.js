/**
 * Created by fredrikstahl on 2019-11-06.
 */

//Labels
import card_header from "@salesforce/label/c.RELATED_CONTRACTS_HEADER";
import submit_btn_text from "@salesforce/label/c.RELATED_CONTRACTS_SUBMIT_BUTTON_TEXT";
import none_found_text from "@salesforce/label/c.RELATED_CONTRACTS_NONE_FOUND";
import column_contract from "@salesforce/label/c.RELATED_CONTRACTS_COLUMN_CONTRACT";
import column_startdate from "@salesforce/label/c.RELATED_CONTRACTS_COLUMN_STARTDATE";
import column_enddate from "@salesforce/label/c.RELATED_CONTRACTS_COLUMN_ENDDATE";
import toast_header_success from "@salesforce/label/c.TOAST_HEADER_SUCCESS";
import toast_header_fail from "@salesforce/label/c.TOAST_HEADER_FAIL";
import modal_header from "@salesforce/label/c.RELATED_CONTRACTS_MODAL_HEADER";
import modal_content from "@salesforce/label/c.RELATED_CONTRACTS_MODAL_CONTENT";
import modal_submit from "@salesforce/label/c.MODAL_SUBMIT";
import modal_cancel from "@salesforce/label/c.MODAL_CANCEL";

import { LightningElement, api, track } from "lwc";
import getContracts from "@salesforce/apex/RelatedContractsController.getRelatedContracts";
import setContractOnOpportunity from "@salesforce/apex/RelatedContractsController.setContractOnOpportunity";
import getCurrentContract from "@salesforce/apex/RelatedContractsController.getContractIdForCurrentOpportunity";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class RelatedContractsCmp extends NavigationMixin(
  LightningElement
) {
  @api recordId;
  @track contractList;
  @track contractData = [];
  @track selectedRow;
  @track isLoading = true;
  @track currentContractId;
  @track preSelectedRows = [];
  @track labels = {
    cardHeader: card_header,
    submitButtonText: submit_btn_text,
    noneFoundText: none_found_text,
    modalHeader: modal_header,
    modalContent: modal_content,
    modalSubmit: modal_submit,
    modalCancel: modal_cancel
  };

  @api sObjectName;
  @api description;
  @api showOnlyActivatedContracts;
  @track showConfirmationModal;

  columns = [
    {
      label: column_contract,
      fieldName: "navUrl",
      type: "url",
      typeAttributes: { label: { fieldName: "contractName" } }
    },
    {
      label: column_startdate,
      fieldName: "startDate",
      type: "date-local"
    },
    {
      label: column_enddate,
      fieldName: "endDate",
      type: "date-local"
    }
  ];

  connectedCallback() {
    getContracts({
      recordId: this.recordId,
      sObjectName: this.sObjectName,
      onlyActivatedContracts: this.showOnlyActivatedContracts
    })
      .then(result => {
        this.isLoading = false;
        console.log("then");
        console.log("result=", JSON.stringify(result));
        this.contractList = result;
        this.contractList.forEach(contract => {
          console.log("contract = " + JSON.stringify(contract));
          console.log(
            "contractPrices = " +
              JSON.stringify(contract.NumberOfContractedPrices__c)
          );
          const newContract = {
            contractName: contract.Account.Name,
            startDate: contract.StartDate,
            endDate: contract.EndDate,
            Id: contract.Id,
            navUrl: "/lightning/r/" + contract.Id + "/view"
          };

          this[NavigationMixin.GenerateUrl]({
            type: "standard__recordPage",
            attributes: {
              recordId: contract.Id,
              actionName: "view"
            }
          }).then(url => {
            newContract.navUrl = url;
            console.log("updated newContract=", JSON.stringify(newContract));
          });
          this.contractData.push(newContract);
        });
      })
      .then(result => {
        if (!this.IsAccountPage) {
          getCurrentContract({
            opportunityId: this.recordId
          }).then(result => {
            console.log("result", JSON.stringify(result));
            let rows = [result];
            this.preSelectedRows = rows;
            this.currentContractId = result;
            console.log(
              "setting preselectedrows=",
              JSON.stringify(this.preSelectedRows)
            );
          });
        }
      })
      .catch(error => {
        console.log("error=", JSON.stringify(error));
        this.isLoading = false;
      });
  }

  handleSetContractButtonClicked() {
    console.log("button clicked! row=", this.selectedRow);
    this.isLoading = true;
    this.showConfirmationModal = true;
  }

  handleModalCancel() {
    console.log("cancel");
    this.showConfirmationModal = false;
    this.isLoading = false;
  }

  handleModalSubmit() {
    console.log("submit");
    setContractOnOpportunity({
      contractId: this.selectedRow.Id,
      opportunityId: this.recordId
    })
      .then(result => {
        console.log("result!", JSON.stringify(result));
        this.isLoading = false;
        let evt = new ShowToastEvent({
          title: toast_header_success,
          message: "Opportunity was updated with the selected contract",
          variant: "success"
        });
        this.dispatchEvent(evt);
        this.showConfirmationModal = false;
        this.connectedCallback();
      })
      .catch(error => {
        console.log("error!", JSON.stringify(error));
        let evt = new ShowToastEvent({
          title: toast_header_fail,
          message: JSON.stringify(error),
          variant: "error"
        });
        this.dispatchEvent(evt);
      });
  }

  handleContractListRowSelection(event) {
    console.log("event = ", JSON.stringify(event.detail));
    this.selectedRow = event.detail.selectedRows[0];
    console.log("row = " + this.selectedRow);
  }

  @api
  get contractsFound() {
    return this.contractList && this.contractList.length > 0;
  }

  @api
  get submitButtonDisabled() {
    return (
      (this.selectedRow !== undefined &&
        this.selectedRow.Id === this.currentContractId) ||
      this.selectedRow === undefined
    );
  }

  @api
  get IsAccountPage() {
    return this.sObjectName === "Account";
  }
}
