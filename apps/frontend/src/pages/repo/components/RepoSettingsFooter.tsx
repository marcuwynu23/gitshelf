import {Cog6ToothIcon} from "@heroicons/react/24/outline";
import {Button} from "~/components/ui/Button";

interface RepoSettingsFooterProps {
  onSettingsClick: () => void;
}

export const RepoSettingsFooter: React.FC<RepoSettingsFooterProps> = ({
  onSettingsClick,
}) => {
  return (
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSettingsClick}
        className="text-[#b0b0b0] hover:text-[#e8e8e8] hover:bg-[#353535]"
      >
        <Cog6ToothIcon className="w-4 h-4 mr-2" />
        Settings
      </Button>
    </div>
  );
};