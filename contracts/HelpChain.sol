// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HelpChain
 * @dev Smart contract for tracking humanitarian aid distribution lifecycle
 * @author HelpChain Team
 */
contract HelpChain {
    // Enums for better code readability
    enum ItemType { Food, Medicine, Clothing, Other }
    enum DeliveryStatus { Pledged, PickedUp, InTransit, Delivered }
    
    // Role-based access control
    mapping(address => bool) public ngos;
    mapping(address => bool) public volunteers;
    address public owner;
    
    // Counter for unique IDs
    uint256 public aidPackageCounter;
    uint256 public donationCounter;
    uint256 public deliveryCounter;
    
    // Data structures
    struct AidPackage {
        uint256 id;
        address ngoAddress;
        string description;
        ItemType itemType;
        uint256 quantity;
        uint256 fundingGoal; // Amount needed in wei
        uint256 currentFunding; // Current amount funded
        bool isFunded;
        bool isDelivered;
        uint256 createdAt;
    }
    
    struct Donation {
        uint256 id;
        address donorAddress;
        uint256 aidPackageId;
        uint256 amountDonated;
        uint256 timestamp;
    }
    
    struct Delivery {
        uint256 id;
        address volunteerAddress;
        uint256 aidPackageId;
        DeliveryStatus status;
        string deliveryProof; // OTP hash or IPFS CID
        uint256 timestamp;
        uint256 lastUpdated;
    }
    
    // Storage mappings
    mapping(uint256 => AidPackage) public aidPackages;
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => Delivery) public deliveries;
    mapping(uint256 => uint256[]) public packageDonations; // packageId => donationIds[]
    mapping(uint256 => uint256) public packageDelivery; // packageId => deliveryId
    
    // Events
    event AidPackageCreated(
        uint256 indexed packageId,
        address indexed ngoAddress,
        string description,
        ItemType itemType,
        uint256 quantity,
        uint256 fundingGoal
    );
    
    event DonationReceived(
        uint256 indexed donationId,
        uint256 indexed packageId,
        address indexed donor,
        uint256 amount
    );
    
    event DeliveryPledged(
        uint256 indexed deliveryId,
        uint256 indexed packageId,
        address indexed volunteer
    );
    
    event StatusUpdated(
        uint256 indexed deliveryId,
        uint256 indexed packageId,
        DeliveryStatus status
    );
    
    event DeliveryConfirmed(
        uint256 indexed deliveryId,
        uint256 indexed packageId,
        address indexed volunteer,
        string deliveryProof
    );
    
    event NGORegistered(address indexed ngoAddress);
    event VolunteerRegistered(address indexed volunteerAddress);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyNGO() {
        require(ngos[msg.sender], "Only registered NGOs can call this function");
        _;
    }
    
    modifier onlyVolunteer() {
        require(volunteers[msg.sender], "Only registered volunteers can call this function");
        _;
    }
    
    modifier packageExists(uint256 _packageId) {
        require(_packageId > 0 && _packageId <= aidPackageCounter, "Package does not exist");
        _;
    }
    
    modifier deliveryExists(uint256 _deliveryId) {
        require(_deliveryId > 0 && _deliveryId <= deliveryCounter, "Delivery does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a new NGO
     * @param _ngoAddress Address of the NGO to register
     */
    function registerNGO(address _ngoAddress) external onlyOwner {
        require(_ngoAddress != address(0), "Invalid NGO address");
        require(!ngos[_ngoAddress], "NGO already registered");
        
        ngos[_ngoAddress] = true;
        emit NGORegistered(_ngoAddress);
    }
    
    /**
     * @dev Register a new volunteer
     * @param _volunteerAddress Address of the volunteer to register
     */
    function registerVolunteer(address _volunteerAddress) external onlyOwner {
        require(_volunteerAddress != address(0), "Invalid volunteer address");
        require(!volunteers[_volunteerAddress], "Volunteer already registered");
        
        volunteers[_volunteerAddress] = true;
        emit VolunteerRegistered(_volunteerAddress);
    }
    
    /**
     * @dev Create a new aid package (NGO only)
     * @param _description Description of the aid package
     * @param _itemType Type of items (Food, Medicine, Clothing, Other)
     * @param _quantity Quantity of items needed
     * @param _fundingGoal Amount of funding needed in wei
     */
    function createAidPackage(
        string memory _description,
        ItemType _itemType,
        uint256 _quantity,
        uint256 _fundingGoal
    ) external onlyNGO returns (uint256) {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        
        aidPackageCounter++;
        
        aidPackages[aidPackageCounter] = AidPackage({
            id: aidPackageCounter,
            ngoAddress: msg.sender,
            description: _description,
            itemType: _itemType,
            quantity: _quantity,
            fundingGoal: _fundingGoal,
            currentFunding: 0,
            isFunded: false,
            isDelivered: false,
            createdAt: block.timestamp
        });
        
        emit AidPackageCreated(
            aidPackageCounter,
            msg.sender,
            _description,
            _itemType,
            _quantity,
            _fundingGoal
        );
        
        return aidPackageCounter;
    }
    
    /**
     * @dev Donate to an aid package
     * @param _packageId ID of the aid package to donate to
     */
    function donateToPackage(uint256 _packageId) 
        external 
        payable 
        packageExists(_packageId) 
        returns (uint256) 
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        AidPackage storage package = aidPackages[_packageId];
        require(!package.isFunded, "Package is already fully funded");
        require(!package.isDelivered, "Package is already delivered");
        
        donationCounter++;
        
        donations[donationCounter] = Donation({
            id: donationCounter,
            donorAddress: msg.sender,
            aidPackageId: _packageId,
            amountDonated: msg.value,
            timestamp: block.timestamp
        });
        
        packageDonations[_packageId].push(donationCounter);
        package.currentFunding += msg.value;
        
        // Check if package is now fully funded
        if (package.currentFunding >= package.fundingGoal) {
            package.isFunded = true;
        }
        
        emit DonationReceived(donationCounter, _packageId, msg.sender, msg.value);
        
        return donationCounter;
    }
    
    /**
     * @dev Pledge to deliver an aid package (Volunteer only)
     * @param _packageId ID of the aid package to deliver
     */
    function pledgeDelivery(uint256 _packageId) 
        external 
        onlyVolunteer 
        packageExists(_packageId) 
        returns (uint256) 
    {
        AidPackage storage package = aidPackages[_packageId];
        require(package.isFunded, "Package must be funded before delivery");
        require(!package.isDelivered, "Package is already delivered");
        require(packageDelivery[_packageId] == 0, "Package already has a delivery pledge");
        
        deliveryCounter++;
        
        deliveries[deliveryCounter] = Delivery({
            id: deliveryCounter,
            volunteerAddress: msg.sender,
            aidPackageId: _packageId,
            status: DeliveryStatus.Pledged,
            deliveryProof: "",
            timestamp: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        packageDelivery[_packageId] = deliveryCounter;
        
        emit DeliveryPledged(deliveryCounter, _packageId, msg.sender);
        
        return deliveryCounter;
    }
    
    /**
     * @dev Update delivery status (Volunteer only)
     * @param _deliveryId ID of the delivery to update
     * @param _status New delivery status
     */
    function updateDeliveryStatus(uint256 _deliveryId, DeliveryStatus _status) 
        external 
        deliveryExists(_deliveryId) 
    {
        Delivery storage delivery = deliveries[_deliveryId];
        require(msg.sender == delivery.volunteerAddress, "Only assigned volunteer can update status");
        require(_status != DeliveryStatus.Delivered, "Use confirmDelivery for final delivery");
        require(delivery.status != DeliveryStatus.Delivered, "Delivery is already completed");
        
        delivery.status = _status;
        delivery.lastUpdated = block.timestamp;
        
        emit StatusUpdated(_deliveryId, delivery.aidPackageId, _status);
    }
    
    /**
     * @dev Confirm final delivery with proof (Volunteer only)
     * @param _deliveryId ID of the delivery to confirm
     * @param _deliveryProof Proof of delivery (OTP hash or IPFS CID)
     */
    function confirmDelivery(uint256 _deliveryId, string memory _deliveryProof) 
        external 
        deliveryExists(_deliveryId) 
    {
        require(bytes(_deliveryProof).length > 0, "Delivery proof cannot be empty");
        
        Delivery storage delivery = deliveries[_deliveryId];
        require(msg.sender == delivery.volunteerAddress, "Only assigned volunteer can confirm delivery");
        require(delivery.status != DeliveryStatus.Delivered, "Delivery is already completed");
        
        AidPackage storage package = aidPackages[delivery.aidPackageId];
        
        delivery.status = DeliveryStatus.Delivered;
        delivery.deliveryProof = _deliveryProof;
        delivery.lastUpdated = block.timestamp;
        
        package.isDelivered = true;
        
        emit DeliveryConfirmed(_deliveryId, delivery.aidPackageId, msg.sender, _deliveryProof);
    }
    
    // View functions
    function getAidPackage(uint256 _packageId) 
        external 
        view 
        packageExists(_packageId) 
        returns (AidPackage memory) 
    {
        return aidPackages[_packageId];
    }
    
    function getDonation(uint256 _donationId) 
        external 
        view 
        returns (Donation memory) 
    {
        require(_donationId > 0 && _donationId <= donationCounter, "Donation does not exist");
        return donations[_donationId];
    }
    
    function getDelivery(uint256 _deliveryId) 
        external 
        view 
        deliveryExists(_deliveryId) 
        returns (Delivery memory) 
    {
        return deliveries[_deliveryId];
    }
    
    function getPackageDonations(uint256 _packageId) 
        external 
        view 
        packageExists(_packageId) 
        returns (uint256[] memory) 
    {
        return packageDonations[_packageId];
    }
    
    function getPackageDelivery(uint256 _packageId) 
        external 
        view 
        packageExists(_packageId) 
        returns (uint256) 
    {
        return packageDelivery[_packageId];
    }
    
    // Emergency functions
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function pause() external onlyOwner {
        // Implementation for emergency pause if needed
    }
}
