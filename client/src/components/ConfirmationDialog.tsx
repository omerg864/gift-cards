import { Button } from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

interface ConfirmationDialogProps {
	onClose: () => void;
	onAccept: () => void;
	title: string;
	body: React.ReactNode | string;
	buttonText?: string;
}

const ConfirmationDialog = ({
	onClose,
	onAccept,
	title,
	body,
	buttonText = 'Confirm',
}: ConfirmationDialogProps) => {
	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{body}
				<DialogFooter style={{ justifyContent: 'space-between' }}>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={onAccept}
						className="bg-teal-600 hover:bg-teal-700"
					>
						{buttonText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationDialog;
