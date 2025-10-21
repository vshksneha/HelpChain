const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("HelpChain", () => {
  let helpChain
  let owner, ngo, donor, volunteer, addr1

  beforeEach(async () => {
    ;[owner, ngo, donor, volunteer, addr1] = await ethers.getSigners()

    const HelpChain = await ethers.getContractFactory("HelpChain")
    helpChain = await HelpChain.deploy()
    await helpChain.waitForDeployment()

    // Register NGO and volunteer
    await helpChain.registerNGO(ngo.address)
    await helpChain.registerVolunteer(volunteer.address)
  })

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await helpChain.owner()).to.equal(owner.address)
    })

    it("Should register NGO correctly", async () => {
      expect(await helpChain.ngos(ngo.address)).to.be.true
    })

    it("Should register volunteer correctly", async () => {
      expect(await helpChain.volunteers(volunteer.address)).to.be.true
    })
  })

  describe("Aid Package Creation", () => {
    it("Should create aid package successfully", async () => {
      const tx = await helpChain.connect(ngo).createAidPackage(
        "Emergency food supplies",
        0, // Food
        100,
        ethers.parseEther("1.0"),
      )

      await expect(tx)
        .to.emit(helpChain, "AidPackageCreated")
        .withArgs(1, ngo.address, "Emergency food supplies", 0, 100, ethers.parseEther("1.0"))

      const aidPackage = await helpChain.getAidPackage(1)
      expect(aidPackage.description).to.equal("Emergency food supplies")
      expect(aidPackage.ngoAddress).to.equal(ngo.address)
    })

    it("Should fail if not called by NGO", async () => {
      await expect(
        helpChain.connect(donor).createAidPackage("Emergency food supplies", 0, 100, ethers.parseEther("1.0")),
      ).to.be.revertedWith("Only registered NGOs can call this function")
    })
  })

  describe("Donations", () => {
    beforeEach(async () => {
      await helpChain.connect(ngo).createAidPackage("Emergency food supplies", 0, 100, ethers.parseEther("1.0"))
    })

    it("Should accept donations successfully", async () => {
      const donationAmount = ethers.parseEther("0.5")

      const tx = await helpChain.connect(donor).donateToPackage(1, {
        value: donationAmount,
      })

      await expect(tx).to.emit(helpChain, "DonationReceived").withArgs(1, 1, donor.address, donationAmount)

      const aidPackage = await helpChain.getAidPackage(1)
      expect(aidPackage.currentFunding).to.equal(donationAmount)
    })

    it("Should mark package as funded when goal is reached", async () => {
      const donationAmount = ethers.parseEther("1.0")

      await helpChain.connect(donor).donateToPackage(1, {
        value: donationAmount,
      })

      const aidPackage = await helpChain.getAidPackage(1)
      expect(aidPackage.isFunded).to.be.true
    })
  })

  describe("Delivery Management", () => {
    beforeEach(async () => {
      await helpChain.connect(ngo).createAidPackage("Emergency food supplies", 0, 100, ethers.parseEther("1.0"))

      await helpChain.connect(donor).donateToPackage(1, {
        value: ethers.parseEther("1.0"),
      })
    })

    it("Should allow volunteer to pledge delivery", async () => {
      const tx = await helpChain.connect(volunteer).pledgeDelivery(1)

      await expect(tx).to.emit(helpChain, "DeliveryPledged").withArgs(1, 1, volunteer.address)

      const delivery = await helpChain.getDelivery(1)
      expect(delivery.volunteerAddress).to.equal(volunteer.address)
      expect(delivery.status).to.equal(0) // Pledged
    })

    it("Should allow status updates", async () => {
      await helpChain.connect(volunteer).pledgeDelivery(1)

      const tx = await helpChain.connect(volunteer).updateDeliveryStatus(1, 1) // PickedUp

      await expect(tx).to.emit(helpChain, "StatusUpdated").withArgs(1, 1, 1)
    })

    it("Should confirm delivery with proof", async () => {
      await helpChain.connect(volunteer).pledgeDelivery(1)

      const tx = await helpChain.connect(volunteer).confirmDelivery(1, "OTP123HASH")

      await expect(tx).to.emit(helpChain, "DeliveryConfirmed").withArgs(1, 1, volunteer.address, "OTP123HASH")

      const aidPackage = await helpChain.getAidPackage(1)
      expect(aidPackage.isDelivered).to.be.true
    })
  })
})
