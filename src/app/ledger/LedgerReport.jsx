import Page from "@/app/dashboard/page";

const LedgerReport = () => {
  return (
    <Page>
             <div className="w-full p-0 md:p-4 grid grid-cols-1">
               <div className="sm:hidden">
                <p>
                  mobile ledger
                </p>
               </div>
       
               <div className="hidden sm:block">
               <p>
                  large ledger
               </p>
               </div>
             </div>
            
           </Page>
  )
}

export default LedgerReport