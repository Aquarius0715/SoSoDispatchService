import { useCallback } from "react";

export function useModal(onClose: () => void) {
    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) {
            onClose();
        }
    }, [onClose]);

    return {
        handleOpenChange,
    }
}