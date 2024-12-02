pragma solidity ^0.4.17;

contract Factory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    address public manager; // address of the person who is managing this campaign
    uint256 public minimumContribution; // Minimum donation required to be considered a contributer or approver
    // address[] public approvers; // list of addresses for every person who has donated money
    mapping(address => bool) public approvers;
    uint public approvalCount = 0;

    // List of requests that the manager has created
    struct Request {
        string description; // Describe why the request being created
        uint256 value; // amount of money that the manager wants to send to the vendor
        address recipient; //  address that the money will be sent to.
        bool complete; // True if the request has already been processed(money sent)
        uint256 approvalsCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    // Constructor function that sets the mininum contribution and the owner
    function Campaign(uint256 minContribution, address creator) public {
        minimumContribution = minContribution;
        manager = creator;
    }

    // callled when someone wants to donate money to the campaign and become and approver
    function contribute() public payable {
        require(msg.value >= minimumContribution);
        // approvers.push(msg.sender);
        approvers[msg.sender] = true;
        approvalCount++;
    }

    // called by the manager to create a new spending request
    function createRequest(
        string description,
        uint256 value,
        address recipient
    ) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalsCount: 0
        });
        requests.push(newRequest);
    }

    // // called by each contributer to approve  a spending request
    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        request.approvals[msg.sender] = true;
        request.approvalsCount++;
    }

    // // after a request has gotten enough approvals, the manager can call this to get money sent to the vendor
    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];

        require(request.approvalsCount > (approvalCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummery()
        public
        view
        returns (uint, uint, uint, uint, address)
    {
        return (
            this.balance,
            minimumContribution,
            requests.length,
            approvalCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }

}
