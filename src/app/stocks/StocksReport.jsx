import Page from "@/app/dashboard/page";

const StocksReport = () => {
  return (
       <Page>
          <div className="w-full p-0 md:p-4 grid grid-cols-1">
            <div className="sm:hidden">
             <p>
               mobile StocksReport
             </p>
            </div>
    
            <div className="hidden sm:block">
            <p>
               large StocksReport
            </p>
            </div>
          </div>
         
        </Page>
  )
}

export default StocksReport