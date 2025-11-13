import CustomIDLModal from "./CustomIDLModal";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "./ui/empty";
import { FolderArchive } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

const NoIDLView = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderArchive />
        </EmptyMedia>
        <EmptyTitle>No IDL Found</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t found any IDL yet. Get started by loading the IDL.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CustomIDLModal/>
        {/* <Button variant="default">Load IDL</Button> */}
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="https://docs.testship.xyz" target="_blank">
          Learn More <ArrowUpRight />
        </a>
      </Button>
    </Empty>
  );
};

export default NoIDLView;
