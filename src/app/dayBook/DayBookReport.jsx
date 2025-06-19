import Page from "@/app/dashboard/page";

const DayBookReport = () => {
  return (
       <Page>
          <div className="w-full p-0 md:p-4 grid grid-cols-1">
            <div className="sm:hidden">
             <p>
               mobile day book
             </p>
            </div>
    
            <div className="hidden sm:block">
            <p>
               large daybook
            </p>
            </div>
          </div>
         
        </Page>
  )
}

export default DayBookReport