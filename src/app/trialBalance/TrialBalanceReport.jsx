import React from 'react'
import Page from "@/app/dashboard/page";

const TrialBalanceReport = () => {
  return (
     <Page>
             <div className="w-full p-0 md:p-4 grid grid-cols-1">
               <div className="sm:hidden">
                <p>
                  mobile trial balance
                </p>
               </div>
       
               <div className="hidden sm:block">
               <p>
                  large trial balance
               </p>
               </div>
             </div>
            
           </Page>
  )
}

export default TrialBalanceReport