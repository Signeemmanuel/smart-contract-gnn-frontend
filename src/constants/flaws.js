/**
 * Client-side presentation metadata for the five DASP flaw classes, keyed by the
 * `type` the API returns. The API's /flaws endpoint owns the canonical name and
 * DASP number; this file adds a colour (matching the CSS ramp) and a plain
 * description for the reference view. Plus a set of one-click sample contracts.
 */
export const FLAW_ORDER = ['reentrancy', 'access_control', 'arithmetic', 'unchecked_calls', 'dos']

export const FLAW_PRESENTATION = {
  reentrancy: {
    color: 'var(--flaw-reentrancy)',
    blurb: 'An external call hands control to another contract before state is settled, letting it call back in and repeat an action — classically, draining a balance.',
  },
  access_control: {
    color: 'var(--flaw-access_control)',
    blurb: 'A sensitive function is missing an ownership or permission check, so anyone can call it — for example seizing ownership or moving funds.',
  },
  arithmetic: {
    color: 'var(--flaw-arithmetic)',
    blurb: 'Integer overflow or underflow wraps a value past its limits, corrupting balances or counters (common before Solidity 0.8 checked arithmetic).',
  },
  unchecked_calls: {
    color: 'var(--flaw-unchecked_calls)',
    blurb: 'The boolean returned by a low-level call (send / call) is ignored, so a failed transfer passes silently and the contract carries on as if it succeeded.',
  },
  dos: {
    color: 'var(--flaw-dos)',
    blurb: 'A single failing or expensive operation in an unbounded loop can block a function for everyone — a denial of service against the contract.',
  },
}

/** Fallback colour for any unexpected type. */
export const flawColor = (type) => FLAW_PRESENTATION[type]?.color || 'var(--muted)'

/** Sample contracts (one per class plus a clean one) for the input panel. */
export const SAMPLES = [
  {
    id: 'reentrancy', label: 'Reentrancy', type: 'reentrancy',
    source: `pragma solidity ^0.4.24;

// The external call happens BEFORE the balance is updated, so a malicious
// recipient can re-enter withdraw() and drain the contract.
contract Reentrant {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount);
        msg.sender.call.value(amount)("");   // external call before state update
        balances[msg.sender] -= amount;
    }
}
`,
  },
  {
    id: 'access_control', label: 'Access control', type: 'access_control',
    source: `pragma solidity ^0.4.24;

// setOwner has no owner check, so anyone can seize ownership and drain funds.
contract Unprotected {
    address public owner;

    constructor() public { owner = msg.sender; }

    function setOwner(address newOwner) public {   // missing onlyOwner
        owner = newOwner;
    }

    function withdrawAll() public {
        require(msg.sender == owner);
        msg.sender.transfer(address(this).balance);
    }
}
`,
  },
  {
    id: 'arithmetic', label: 'Arithmetic', type: 'arithmetic',
    source: `pragma solidity ^0.4.24;

// Pre-0.8 unchecked arithmetic: subtracting more than the balance underflows
// to a huge number instead of reverting.
contract Token {
    mapping(address => uint) public balanceOf;

    function transfer(address to, uint amount) public {
        balanceOf[msg.sender] -= amount;   // underflows if amount > balance
        balanceOf[to] += amount;
    }
}
`,
  },
  {
    id: 'unchecked_calls', label: 'Unchecked call', type: 'unchecked_calls',
    source: `pragma solidity ^0.4.24;

// send() returns a bool that is ignored, so a failed transfer passes silently.
contract Refunder {
    function refund(address recipient, uint amount) public {
        recipient.send(amount);   // return value not checked
    }
}
`,
  },
  {
    id: 'dos', label: 'Denial of service', type: 'dos',
    source: `pragma solidity ^0.4.24;

// One failing transfer in the unbounded loop blocks refunds for everyone.
contract Auction {
    address[] public refundAddresses;
    mapping(address => uint) public refunds;

    function refundAll() public {
        for (uint i = 0; i < refundAddresses.length; i++) {
            refundAddresses[i].transfer(refunds[refundAddresses[i]]);
        }
    }
}
`,
  },
  {
    id: 'safe', label: 'Clean contract', type: null,
    source: `pragma solidity ^0.4.24;

// A simple, flaw-free contract: expect no findings.
contract Counter {
    uint256 public count;

    function increment() public {
        count += 1;
    }
}
`,
  },
]
