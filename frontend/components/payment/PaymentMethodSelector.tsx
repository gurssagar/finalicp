'use client'
import React, { useState } from 'react';
import { CreditCard, Wallet, Bitcoin, Check } from 'lucide-react';

type PaymentMethod = 'credit-card' | 'bitpay' | 'icp';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'credit-card' as PaymentMethod,
      name: 'Credit Card',
      description: 'Pay with Visa, Mastercard, or American Express',
      icon: CreditCard,
      popular: true,
      features: ['Secure payment', 'Buyer protection', 'Instant processing']
    },
    {
      id: 'bitpay' as PaymentMethod,
      name: 'BitPay',
      description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies',
      icon: Bitcoin,
      features: ['Crypto payment', 'Low fees', 'Fast transactions']
    },
    {
      id: 'icp' as PaymentMethod,
      name: 'ICP Wallet',
      description: 'Pay directly with Internet Computer tokens',
      icon: Wallet,
      features: ['Native token', 'No gas fees', 'Blockchain security']
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-medium mb-4">Select Payment Method</h3>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon size={20} />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <div className="flex items-center space-x-2">
                      {method.popular && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                      {isSelected && (
                        <Check className="text-purple-600" size={20} />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{method.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment Form based on selected method */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {selectedMethod === 'credit-card' && <CreditCardForm />}
        {selectedMethod === 'bitpay' && <BitPayForm />}
        {selectedMethod === 'icp' && <ICPForm />}
      </div>
    </div>
  );
}

function CreditCardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19); // Max 19 chars for 16 digit card + spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <input type="checkbox" id="save-card" className="rounded border-gray-300" />
        <label htmlFor="save-card">Save card for future purchases</label>
      </div>
    </div>
  );
}

function BitPayForm() {
  const [cryptoType, setCryptoType] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState('');

  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
    { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
    { value: 'USDC', label: 'USD Coin (USDC)', icon: '$' },
    { value: 'USDT', label: 'Tether (USDT)', icon: '₮' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Cryptocurrency
        </label>
        <select
          value={cryptoType}
          onChange={(e) => setCryptoType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {cryptoOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Refund Wallet Address (Optional)
        </label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter your wallet address for refunds"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Bitcoin className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-blue-900">BitPay Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              You will be redirected to BitPay to complete your cryptocurrency payment securely.
              The exchange rate will be locked at the time of payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ICPForm() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = () => {
    // Mock wallet connection - in real implementation, this would connect to Internet Identity or other ICP wallet
    setWalletConnected(true);
    setWalletAddress('0x1234...5678'); // Mock address
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  return (
    <div className="space-y-4">
      {!walletConnected ? (
        <div>
          <button
            onClick={connectWallet}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Wallet size={20} />
            <span>Connect ICP Wallet</span>
          </button>

          <div className="mt-4 text-sm text-gray-600">
            <p>Connect your Internet Computer wallet to pay with ICP tokens.</p>
            <p className="mt-1">Supported wallets: Internet Identity, Plug, Stoic, and more.</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-900">Wallet Connected</h4>
                <p className="text-sm text-green-700 font-mono mt-1">{walletAddress}</p>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Available Balance</span>
              <span className="font-medium">150.5 ICP</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Wallet className="text-purple-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-purple-900">ICP Payment Benefits</h4>
            <ul className="text-sm text-purple-700 mt-1 space-y-1">
              <li>• No gas fees on the Internet Computer</li>
              <li>• Instant transaction confirmation</li>
              <li>• Direct blockchain settlement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}