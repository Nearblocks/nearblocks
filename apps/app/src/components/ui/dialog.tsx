import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react';
import * as React from 'react';

import { CloseButton } from './close-button';

interface DialogContentProps extends ChakraDialog.ContentProps {
  backdrop?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(function DialogContent(props, ref) {
  const {
    backdrop = true,
    children,
    portalled = true,
    portalRef,
    ...rest
  } = props;

  return (
    <Portal container={portalRef} disabled={!portalled}>
      {backdrop && <ChakraDialog.Backdrop />}
      <ChakraDialog.Positioner>
        <ChakraDialog.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  );
});

export const DialogCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraDialog.CloseTriggerProps
>(function DialogCloseTrigger(props, ref) {
  return (
    <ChakraDialog.CloseTrigger
      insetEnd="2"
      position="absolute"
      top="2"
      {...props}
      asChild
    >
      <CloseButton ref={ref} size="sm">
        {props.children}
      </CloseButton>
    </ChakraDialog.CloseTrigger>
  );
});

export const DialogRoot = ChakraDialog.Root;
export const DialogFooter = ChakraDialog.Footer;
export const DialogHeader = ChakraDialog.Header;
export const DialogBody = ChakraDialog.Body;
export const DialogBackdrop = ChakraDialog.Backdrop;
export const DialogTitle = ChakraDialog.Title;
export const DialogDescription = ChakraDialog.Description;
export const DialogTrigger = ChakraDialog.Trigger;
export const DialogActionTrigger = ChakraDialog.ActionTrigger;
