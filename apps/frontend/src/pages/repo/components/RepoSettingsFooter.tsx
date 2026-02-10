import {Cog6ToothIcon} from "@heroicons/react/24/outline";
import {Button} from "~/components/ui/Button";

interface RepoSettingsFooterProps {
  onSettingsClick: () => void;
}

export const RepoSettingsFooter: React.FC<RepoSettingsFooterProps> = ({
  onSettingsClick,
}) => {
  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        onClick={onSettingsClick}
        className="bg-transparent! border-0! shadow-none! text-text-secondary hover:text-text-primary !hover:bg-app-hover"
        aria-label="Open repository settings"
      >
        <Cog6ToothIcon className="w-4 h-4" />
        Settings
      </Button>
    </div>
  );
};
