// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HelpChain
 * @dev A contract for managing humanitarian aid campaigns, donations, and verifiable aid delivery.
 */
contract HelpChain {
    // --- Data Structures ---
    
    // Structure for a single donation transaction (stored primarily for event emission/traceability)
    struct Donation {
        address donor;
        uint256 amount; // in Wei
        uint256 timestamp;
    }
    
    // Structure for a humanitarian aid campaign
    struct Campaign {
        address payable ngo;            // The NGO that created the campaign
        string title;
        uint256 targetAmount;           // The target funding goal in Wei
        uint256 raisedAmount;           // Current raised amount in Wei
        bool isVerified;                // True if aid delivery has been verified by the Volunteer
        address assignedVolunteer;      // Wallet address of the volunteer assigned for verification
        bool exists;                    // Flag to validate campaign existence
    }

    // --- State Variables ---
    
    // Mapping from unique Campaign ID to the Campaign struct
    mapping(uint256 => Campaign) public campaigns;
    // Counter for generating unique Campaign IDs
    uint256 public nextCampaignId = 0; 
    
    // Mapping from Campaign ID to an array of its Donation records
    mapping(uint256 => Donation[]) public campaignDonations;

    // --- Events for Traceability ---

    event CampaignCreated(
        uint256 indexed campaignId, 
        address indexed ngo, 
        string title, 
        uint256 targetAmount
    );
    event DonationReceived(
        uint256 indexed campaignId, 
        address indexed donor, 
        uint256 amount, 
        bytes32 indexed txnHashPlaceholder // Placeholder for external tracking
    );
    event AidDeliveryVerified(
        uint256 indexed campaignId, 
        address indexed volunteer, 
        uint256 timestamp
    );

    // --- Modifiers ---

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < nextCampaignId && campaigns[_campaignId].exists, "Campaign does not exist.");
        _;
    }

    modifier onlyAssignedVolunteer(uint256 _campaignId) {
        require(
            msg.sender == campaigns[_campaignId].assignedVolunteer, 
            "Caller is not the assigned Volunteer for this campaign."
        );
        _;
    }

    // --- Core Functions ---

    /**
     * @dev Creates a new humanitarian campaign. Assumes caller is a verified NGO.
     * @param _title The campaign title.
     * @param _targetAmount The target funding goal in Wei.
     * @return The unique ID of the newly created campaign.
     */
    function createCampaign(string memory _title, uint256 _targetAmount) public returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than zero.");
        
        uint256 newId = nextCampaignId++;
        
        campaigns[newId] = Campaign({
            ngo: payable(msg.sender),
            title: _title,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            isVerified: false,
            assignedVolunteer: address(0),
            exists: true
        });
        
        emit CampaignCreated(newId, msg.sender, _title, _targetAmount);
        return newId;
    }

    /**
     * @dev Allows a donor to contribute funds to a campaign (payable function).
     * Records the transaction and updates the raised amount.
     * @param _campaignId The ID of the campaign to donate to.
     */
    function donateToCampaign(uint256 _campaignId) public payable campaignExists(_campaignId) {
        require(msg.value > 0, "Donation amount must be greater than zero.");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        campaign.raisedAmount += msg.value;

        // Record the donation for internal tracking
        campaignDonations[_campaignId].push(
            Donation({
                donor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp
            })
        );

        // Emit event. Txn Hash placeholder used; backend reads the actual hash from the receipt.
        emit DonationReceived(_campaignId, msg.sender, msg.value, bytes32(0)); 
    }
    
    /**
     * @dev Sets the volunteer responsible for verifying aid delivery (NGO/Admin action).
     * NOTE: This function is expected to be called by the backend service.
     * @param _campaignId The ID of the campaign.
     * @param _volunteer The wallet address of the volunteer.
     */
    function assignVolunteer(uint256 _campaignId, address _volunteer) public campaignExists(_campaignId) {
        // Add specific NGO role check off-chain or by a dedicated role contract if required.
        require(_volunteer != address(0), "Volunteer address cannot be zero.");
        campaigns[_campaignId].assignedVolunteer = _volunteer;
        // NOTE: A separate event for assignment tracking could be added here.
    }
    
    /**
     * @dev Confirms that the aid delivery has been completed (Volunteer action).
     * The volunteer's address must match the assigned volunteer address.
     * @param _campaignId The ID of the campaign.
     */
    function verifyDelivery(uint256 _campaignId) public onlyAssignedVolunteer(_campaignId) campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.isVerified, "Aid delivery already verified.");

        campaign.isVerified = true;

        emit AidDeliveryVerified(_campaignId, msg.sender, block.timestamp);
    }

    /**
     * @dev Retrieves campaign details for transparency and tracking.
     * @param _campaignId The ID of the campaign.
     */
    function getCampaignDetails(uint256 _campaignId) 
        public 
        view 
        campaignExists(_campaignId) 
        returns (
            address ngo, 
            string memory title, 
            uint256 target, 
            uint256 raised, 
            bool isVerified,
            address volunteer
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.ngo, 
            campaign.title, 
            campaign.targetAmount, 
            campaign.raisedAmount, 
            campaign.isVerified,
            campaign.assignedVolunteer
        );
    }
}