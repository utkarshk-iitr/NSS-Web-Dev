import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layouts/UserLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { FiHeart, FiDollarSign, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MakeDonation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(true);

  const presetAmounts = [100, 500, 1000, 2500, 5000, 10000];

  // Check if payment gateway is configured
  useEffect(() => {
    const checkGatewayConfig = async () => {
      try {
        const response = await api.get('/donation/config');
        setMockMode(response.data.mockMode);
      } catch (error) {
        console.log('Gateway config check failed, using mock mode');
        setMockMode(true);
      } finally {
        setGatewayLoading(false);
      }
    };
    checkGatewayConfig();
  }, []);

  const handleDonation = async () => {
    const donationAmount = parseInt(amount);
    
    if (!donationAmount || donationAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await api.post('/donation/create-order', {
        amount: donationAmount,
        notes
      });

      const { order, donationId, mockMode: isMockMode, appId } = orderResponse.data;

      if (isMockMode) {
        // MOCK MODE - Show mock payment dialog
        handleMockPayment(order.orderId, donationAmount);
      } else {
        // LIVE MODE - Use Cashfree checkout
        const cashfree = window.Cashfree({
          mode: 'sandbox' // Use 'production' for live
        });

        const checkoutOptions = {
          paymentSessionId: order.paymentSessionId,
          redirectTarget: '_modal'
        };

        cashfree.checkout(checkoutOptions).then(async (result) => {
          if (result.error) {
            // Payment error
            console.error('Payment error:', result.error);
            await api.post('/donation/payment-failed', {
              orderId: order.orderId,
              reason: result.error.message || 'Payment failed'
            });
            toast.error('Payment failed: ' + (result.error.message || 'Unknown error'));
          } else if (result.redirect) {
            // Payment redirected - user will be redirected to return URL
            console.log('Payment redirected');
          } else if (result.paymentDetails) {
            // Payment completed
            try {
              const verifyResponse = await api.post('/donation/verify-payment', {
                orderId: order.orderId,
                mockMode: false
              });

              if (verifyResponse.data.success) {
                setSuccess(true);
                setSuccessData(verifyResponse.data.donation);
                toast.success('Donation successful! Thank you for your generosity.');
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate donation');
    } finally {
      setLoading(false);
    }
  };

  // Mock payment handler for testing without Cashfree keys
  const handleMockPayment = (orderId, donationAmount) => {
    // Show mock payment confirmation
    const confirmed = window.confirm(
      `🧪 MOCK PAYMENT MODE\n\n` +
      `Amount: ₹${donationAmount}\n\n` +
      `This is a simulated payment for testing.\n` +
      `Click OK to simulate successful payment.\n` +
      `Click Cancel to simulate failed payment.`
    );

    if (confirmed) {
      // Simulate successful payment
      simulatePaymentResult(orderId, 'success', donationAmount);
    } else {
      // Simulate failed payment
      simulatePaymentResult(orderId, 'failed', donationAmount);
    }
  };

  const simulatePaymentResult = async (orderId, status, donationAmount) => {
    setLoading(true);
    try {
      if (status === 'success') {
        const verifyResponse = await api.post('/donation/verify-payment', {
          orderId,
          mockMode: true,
          mockStatus: 'success'
        });

        setSuccess(true);
        setSuccessData(verifyResponse.data.donation);
        toast.success('Mock payment successful! (Test Mode)');
      } else {
        await api.post('/donation/payment-failed', {
          orderId,
          reason: 'User cancelled mock payment'
        });
        toast.error('Mock payment cancelled');
      }
    } catch (error) {
      toast.error('Error processing mock payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <UserLayout>
        <div className="max-w-lg mx-auto text-center py-12 animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-6">
            Your donation of {formatCurrency(successData?.amount || amount)} has been received successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Receipt ID</p>
            <p className="font-mono text-lg font-medium text-gray-900">{successData?.receiptId}</p>
          </div>
          {mockMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-700">
                🧪 This was a test payment (Mock Mode)
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                setAmount('');
                setNotes('');
              }}
              className="btn-primary"
            >
              Donate Again
            </button>
            <button
              onClick={() => navigate('/donations')}
              className="btn-secondary"
            >
              View Donations
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="text-primary-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Make a Donation</h1>
          <p className="text-gray-500 mt-2">
            Your generosity helps us create positive change
          </p>
        </div>

        {/* Mock Mode Banner */}
        {!gatewayLoading && mockMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <FiAlertCircle className="text-yellow-600 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Test Mode Active</p>
              <p className="text-sm text-yellow-700 mt-1">
                Cashfree is not configured. Payments will be simulated for testing purposes.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Preset Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    amount === preset.toString()
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in rupees"
              min="1"
              className="input-field text-lg"
            />
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a message with your donation..."
              rows="3"
              className="input-field resize-none"
            />
          </div>

          {/* Summary */}
          {amount && parseInt(amount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Donation Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(parseInt(amount))}
                </span>
              </div>
            </div>
          )}

          {/* Donate Button */}
          <button
            onClick={handleDonation}
            disabled={loading || !amount || parseInt(amount) < 1 || gatewayLoading}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || gatewayLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiCreditCard />
                <span>{mockMode ? 'Test Payment' : 'Proceed to Pay'}</span>
              </>
            )}
          </button>

          {/* Security Note */}
          <p className="text-center text-sm text-gray-500 mt-4">
            🔒 {mockMode ? 'Test mode - no real transactions' : 'Secured by Cashfree. Your payment information is safe.'}
          </p>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Your donation attempt will be recorded regardless of payment outcome. 
            You can view all your donation attempts in the "My Donations" section.
          </p>
        </div>
      </div>
    </UserLayout>
  );
};

export default MakeDonation;
