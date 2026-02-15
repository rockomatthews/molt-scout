// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Agent Ops Toolkit Token (AOT)
 *
 * Minimal ERC-20 with fixed supply minted to an initial owner.
 * No taxes, no blacklist, no pause. Utility token gating happens offchain.
 */
contract AOT {
    string public name = "Agent Ops Toolkit";
    string public symbol = "AOT";
    uint8 public immutable decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(address initialOwner, uint256 initialSupply) {
        require(initialOwner != address(0), "owner=0");
        totalSupply = initialSupply;
        balanceOf[initialOwner] = initialSupply;
        emit Transfer(address(0), initialOwner, initialSupply);
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "to=0");
        uint256 bal = balanceOf[from];
        require(bal >= value, "balance");
        unchecked {
            balanceOf[from] = bal - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }
}
