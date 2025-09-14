import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import BBLogo from "@/assets/bb-logo.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md gradient-card border-0 shadow-brand">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={BBLogo} alt="BuildTrack" className="h-12" />
            </div>
            <div>
              <CardTitle className="text-2xl font-montserrat font-bold text-foreground">
                Check Your Email
              </CardTitle>
              <CardDescription className="font-inter text-muted-foreground">
                We've sent password reset instructions to your email
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="border-info/20 bg-info/10">
              <Mail className="h-4 w-4 text-info" />
              <AlertDescription className="font-inter text-info">
                If an account with that email exists, you'll receive reset instructions within a few minutes.
              </AlertDescription>
            </Alert>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/login" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md gradient-card border-0 shadow-brand">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={BBLogo} alt="BuildTrack" className="h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-montserrat font-bold text-foreground">
              Reset Password
            </CardTitle>
            <CardDescription className="font-inter text-muted-foreground">
              Enter your email address and we'll send you reset instructions
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-inter font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-inter"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </Button>
            
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;