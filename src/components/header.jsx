import React from 'react'
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from 'react-router-dom'
import { LinkIcon } from 'lucide-react'

/**
 * Optimized Header Component
 * Simplified without authentication logic for better performance
 */
const Header = () => {
    const navigate = useNavigate();
    
    return (
        <div className='py-2 px-4 flex justify-between items-center'>
            <Link to="/">
                <img src='/logo.png' className='md:h-12 h-10' alt='Trimly Logo'></img>
            </Link>
            <div className='flex items-center gap-3 mr-2'>
                <Button 
                    onClick={() => navigate("/dashboard")} 
                    className="bg-[#41414b] hover:bg-[#5d5e6c] flex items-center gap-2"
                    variant="default"
                >
                    <LinkIcon className="h-4 w-4" />
                    My Links
                </Button>
            </div>
        </div>
    )
}

export default Header