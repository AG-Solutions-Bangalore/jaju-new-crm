import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const NotesCard = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-1">
        <CardTitle className="text-blue-800 text-lg">Important Notes</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <ul className="space-y-1 text-blue-700">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            Changing an account name will update it across all transactions
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            This action cannot be undone
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            Make sure the new name is unique and descriptive
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default NotesCard;
