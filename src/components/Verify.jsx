import React, { useState } from 'react';
import axios from 'axios';
import { BrowserProvider } from 'ethers'; // Correct import from ethers v6

function Verify() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    passportNumber: '',
    series: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      await axios.post('http://localhost:8000/verify', {
        ...form,
        wallet: userAddress
      });

      alert("Verification request submitted!");
    } catch (error) {
      console.error("Verification submission failed:", error);
      alert("Something went wrong during verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      fontFamily: '"Open Sans", sans-serif',
      background: 'linear-gradient(135deg, #6C63FF 0%, #4c46b6 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        position: 'relative'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{
              color: '#6C63FF',
              fontSize: '2em',
              fontWeight: '800',
              margin: '0 0 10px 0'
            }}>
              Verify Identity
            </h2>
            <p style={{
              color: '#707070',
              fontSize: '0.95em',
              margin: '0'
            }}>
              Please provide your identification details for verification
            </p>
          </div>

          {['firstName', 'lastName', 'passportNumber', 'series'].map((field, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <input
                type="text"
                name={field}
                placeholder={{
                  firstName: "First Name",
                  lastName: "Last Name",
                  passportNumber: "Identity Number",
                  series: "ID Series"
                }[field]}
                value={form[field]}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '1em',
                  fontFamily: '"Open Sans", sans-serif',
                  transition: 'all 250ms ease',
                  outline: 'none',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '50px',
              backgroundColor: isSubmitting ? '#9CA3AF' : '#6C63FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontFamily: '"Open Sans", sans-serif',
              fontSize: '1.10em',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 250ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#4c46b6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#6C63FF';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px'
                }}></div>
                Submitting...
              </>
            ) : (
              'Submit Verification'
            )}
          </button>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9ff',
            borderRadius: '4px',
            border: '1px solid #e8ebff'
          }}>
            <p style={{
              fontSize: '0.85em',
              color: '#707070',
              margin: '0',
              lineHeight: '1.5'
            }}>
              🔒 Your information is secure and will be used only for identity verification purposes. 
              All data is encrypted and stored securely.
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Verify;
