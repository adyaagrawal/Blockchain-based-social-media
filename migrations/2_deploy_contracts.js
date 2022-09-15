const smBlockchain = artifacts.require("Decentragram");

module.exports = function(deployer) {
  deployer.deploy(smBlockchain);
};