import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from '../ui/use-toast';
import { Loader2, Trash2, Wallet, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Info } from 'lucide-react';

interface BlockchainNetwork {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  chainId: string;
  rpcUrl: string;
  blockExplorer: string;
  validateAddress: (address: string) => boolean;
}

const SUPPORTED_NETWORKS: BlockchainNetwork[] = [
  {
    id: 'base',
    name: 'Base Network',
    logo: 'https://storage.googleapis.com/ks-setting-1d682dca/a57f3983-8573-4f43-8b4c-f5217aee72b11697621136693.png',
    enabled: true,
    chainId: '8453',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    validateAddress: (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  // Add more networks here when needed
];

interface WalletData {
  address: string;
  network: string;
}

const ExternalWallet: React.FC = () => {
  const { currentUser } = useAuth();
  const [walletData, setWalletData] = useState<WalletData>({
    address: '',
    network: 'base'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentNetwork = SUPPORTED_NETWORKS.find(network => network.id === walletData.network);

  useEffect(() => {
    fetchWalletData();
  }, [currentUser?.uid]);

  const fetchWalletData = async () => {
    if (!currentUser?.uid) return;
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'staffs', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setWalletData({
          address: data.usdcWallet?.address || '',
          network: data.usdcWallet?.network || 'base'
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch wallet data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    if (!walletData.address.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid USDC address"
      });
      return;
    }
    if (!currentNetwork || !currentNetwork.validateAddress(walletData.address)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Invalid address for ${currentNetwork ? currentNetwork.name : 'selected network'}`
      });
      return;
    }
    try {
      setSaving(true);
      const userRef = doc(db, 'staffs', currentUser.uid);
      await updateDoc(userRef, {
        usdcWallet: {
          address: walletData.address.trim(),
          network: walletData.network
        }
      });
      toast({
        title: "Success",
        description: "USDC address saved successfully"
      });
    } catch (error) {
      console.error('Error saving wallet data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save USDC address"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.uid) return;
    try {
      setDeleting(true);
      const userRef = doc(db, 'staffs', currentUser.uid);
      await updateDoc(userRef, {
        usdcWallet: deleteField()
      });
      setWalletData({ address: '', network: 'base' });
      toast({
        title: "Success",
        description: "USDC address deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting wallet data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete USDC address"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = async () => {
    if (!walletData.address) return;
    
    try {
      await navigator.clipboard.writeText(walletData.address);
      setCopied(true);
      toast({
        title: "Success",
        description: "Wallet address copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying wallet address:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy wallet address"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin text-white w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <CardTitle>USDC Wallet</CardTitle>
          </div>
          <CardDescription>
            Add your USDC address to receive commission. You can update or delete it at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!walletData.address && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You haven't added a USDC address yet. Add one to receive payments.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {currentNetwork && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <img
                    src={currentNetwork.logo}
                    alt={`${currentNetwork.name} logo`}
                    className="w-6 h-6 object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{currentNetwork.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Currently the only supported network for USDC payments
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  USDC Address
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={walletData.address}
                    onChange={(e) => setWalletData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your Base network USDC address"
                    className="w-full pr-10"
                  />
                  {walletData.address && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || deleting}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    walletData.address ? 'Update Address' : 'Save Address'
                  )}
                </Button>

                {walletData.address && (
                  <Button
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    variant="destructive"
                    className="flex-1"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalWallet; 