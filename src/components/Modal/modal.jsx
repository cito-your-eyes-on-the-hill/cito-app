import { Button } from "@/components/ui/button";

export const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const handleBackgroundClick = (e) => {
        if (e.target.id === "modalBackground") {
            onClose();
        }
    };

    return (
        <div id="modalBackground" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={handleBackgroundClick}>
            <div className="flex flex-col justify-between bg-white p-4 rounded-lg shadow-lg w-11/12 h-11/12 overflow-auto" onClick={(e) => e.stopPropagation()}>
                <div>
                    {children}
                </div>
                <Button onClick={onClose} className="self-center mt-4">
                    Close
                </Button>
            </div>
        </div>
    );
};
