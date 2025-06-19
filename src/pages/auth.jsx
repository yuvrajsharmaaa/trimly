import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Login from '@/components/login'
import Signup from '@/components/signup'
import { UrlState } from '@/context'
import supabase from '@/db/superbase'
import { Button } from "@/components/ui/button"

const Auth = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");
  const navigate = useNavigate();
  const { isAuthenticated, loading, continueAsGuest } = UrlState();

  useEffect(() => {
    {
      if (isAuthenticated && !loading) {
        navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`)
      }
    }
  }, [isAuthenticated, loading])

  const handleGuestContinue = () => {
    continueAsGuest();
    navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
  };

  return (
    <div className='min-h-screen w-full flex flex-col justify-center items-center px-2'>
      <h1 className='text-2xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6'>
        {longLink ? "Hold up! Let's login first.." :
          "Login/Signup"}
      </h1>
      <Tabs defaultValue="login" className="w-full max-w-xs sm:max-w-md  rounded-xl shadow-lg p-4 sm:p-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#737584] rounded-lg mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>
        <Login />
        <Signup />
      </Tabs>
      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-2">Don't want to create an account?</p>
        <Button 
          variant="outline" 
          onClick={handleGuestContinue}
          className="hover:bg-gray-100"
        >
          Continue as Guest
        </Button>
      </div>
    </div>
  )
}

export default Auth

