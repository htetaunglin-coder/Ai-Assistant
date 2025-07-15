import { BasicHomeLayout } from "@/features/home/components/basic-home-layout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mijn-ui/react";
import Link from "next/link";

const NotFound = () => {
  return (
    <BasicHomeLayout>
      <Card className="mx-auto max-w-lg border-none bg-transparent text-center">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </BasicHomeLayout>
  );
};

export default NotFound;
