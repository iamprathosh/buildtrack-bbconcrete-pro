import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Smartphone, Download, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import BBLogo from "@/assets/bb-logo.jpg";
import { useToast } from "@/hooks/use-toast";

const Setup2FA = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  
  const qrCodeUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="; // Placeholder
  const secretKey = "JBSWY3DPEHPK3PXP";
  const recoveryCodes = [
    "12345-67890",
    "23456-78901", 
    "34567-89012",
    "45678-90123",
    "56789-01234",
    "67890-12345"
  ];

  const handleVerification = () => {
    if (verificationCode === "123456") {
      setIsVerified(true);
      setCurrentStep(3);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please check your authenticator app and try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-lg gradient-card border-0 shadow-brand">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={BBLogo} alt="BuildTrack" className="h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-montserrat font-bold text-foreground">
              Set Up Two-Factor Authentication
            </CardTitle>
            <CardDescription className="font-inter text-muted-foreground">
              Secure your account with an additional verification step
            </CardDescription>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <Badge 
                key={step}
                variant={currentStep >= step ? "default" : "outline"}
                className={currentStep >= step ? "bg-primary text-primary-foreground" : ""}
              >
                {step}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert className="border-info/20 bg-info/10">
                <Download className="h-4 w-4 text-info" />
                <AlertDescription className="font-inter text-info">
                  <strong>Step 1:</strong> Install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator on your phone.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm font-inter text-muted-foreground">
                  Popular authenticator apps:
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="outline" className="font-inter">Google Authenticator</Badge>
                  <Badge variant="outline" className="font-inter">Authy</Badge>
                  <Badge variant="outline" className="font-inter">Microsoft Authenticator</Badge>
                </div>
              </div>
              
              <Button onClick={() => setCurrentStep(2)} variant="primary" className="w-full">
                I've Installed an App
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert className="border-info/20 bg-info/10">
                <Smartphone className="h-4 w-4 text-info" />
                <AlertDescription className="font-inter text-info">
                  <strong>Step 2:</strong> Scan the QR code with your authenticator app or enter the secret key manually.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto bg-gray-200" />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-inter font-medium">Or enter this secret key manually:</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={secretKey} 
                      readOnly 
                      className="font-mono text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(secretKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verification" className="font-inter font-medium">
                  Enter the 6-digit code from your app:
                </Label>
                <Input
                  id="verification"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="font-mono text-center text-lg"
                />
              </div>
              
              <Button 
                onClick={handleVerification}
                variant="primary" 
                className="w-full"
                disabled={verificationCode.length !== 6}
              >
                Verify and Enable 2FA
              </Button>
            </div>
          )}

          {currentStep === 3 && isVerified && (
            <div className="space-y-4">
              <Alert className="border-success/20 bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="font-inter text-success">
                  <strong>Success!</strong> Two-factor authentication has been enabled for your account.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-inter font-semibold text-foreground mb-2">Recovery Codes</h4>
                  <p className="text-sm font-inter text-muted-foreground mb-3">
                    Save these recovery codes in a safe place. You can use them to access your account if you lose your phone.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-1">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                  variant="outline" 
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Recovery Codes
                </Button>
              </div>
              
              <Button asChild variant="primary" className="w-full">
                <Link to="/profile">
                  Continue to Profile
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup2FA;