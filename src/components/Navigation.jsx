import React from 'react';
import { ethers } from "ethers"; 
import logo from '../assets/logo.svg'; 

function Navigation({ account, setAccount }) {
    const connectHandler = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = ethers.getAddress(accounts[0]);
                setAccount(account);
            } catch (err) {
                console.error("User rejected connection or error occurred:", err);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="/verify">Verify</a></li>
                <li><a href="/mint">Mint</a></li>
                <li><a href="/manage">Manage Properties</a></li>
            </ul>

            <div className='nav__brand'>
                
                <h1>RE Marketplace</h1>
            </div>

            {account ? (
                <button type="button" className='nav__connect'>
                    {account.slice(0, 6) + '...' + account.slice(38)}
                </button>
            ) : (
                <button type="button" className='nav__connect' onClick={connectHandler}>
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;
