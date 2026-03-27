import React, { useState } from 'react';
import { register as apiRegister } from '@/lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordIsStrong = (pass: string) => {
    const length = pass.length >= 8;
    const lower = /[a-z]/.test(pass);
    const upper = /[A-Z]/.test(pass);
    const number = /\d/.test(pass);
    const special = /[^A-Za-z0-9]/.test(pass);
    return length && lower && upper && number && special;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Fill all fields'); return; }
    if (!passwordIsStrong(password)) {
      toast.error('Password must be at least 8 chars and include uppercase, lowercase, number and special character');
      return;
    }

    setLoading(true);
    try {
      await apiRegister({ name, email, password });
      toast.success('Registration successful. Waiting for admin approval.');
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) toast.error(err.message || 'Registration failed');
      else toast.error('Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Minimum 8 characters, uppercase, lowercase, number, special char.</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</Button>
            </form>
            <div className="mt-4 text-sm text-center text-muted-foreground">
              Already registered? <Link to="/login" className="text-primary hover:underline">Sign in here</Link>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
