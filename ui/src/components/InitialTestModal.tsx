import { useState, useEffect } from 'react';
import useHasVisited from '@/hooks/useHasVisited';
import { useIDL } from '@/context/IDLContext';
import { Button } from './ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import CustomIDLModal from './CustomIDLModal';
import { ExternalLink } from 'lucide-react';
 
const EXAMPLE_PROGRAMS = [
  {
    name: 'Counter Program',
    url: 'https://app.testship.xyz/s#state=N4IglgJgNiBcoEMIQE4FMDOG4gMwA8ARAdwCEAtcgFwHsA1ALwAcnS6AjUgZWIE0BFALakAngHYw7NOxoA7cgBYAZgAVZsgBIBGABa46xAOYgANCEFoqSBFbihZCCzgDGNAK6yqaFKZAA3bwwwORwABgA6LXDQ3wwmNGcwyOjfCExnFDAmKmDZHABhdBs0CAACYjAqHVKAQVlnHRofAF8zMFkMKhQ3Zxy5bFgAbXtHNBcoGgwxswgwDAywQXabJrhBgE4ADhMtADYAVhMAJlCtHbExHdDtg+PQ3ZN13YBdMwRnVw8qAeGQBydYCAmAgRN5fMRMlZ2FAxrAum40GYgoZZGC4d00K0RgCQJ9PGCzBDKghobD4ZjXiAEChDD9nli-qMcGkMmgLJ5UnMFksHLQfEMtPdjkdLnttvt1scFNsRTt9qErlpKe88d81tjYbj3PifITISSYXByc1lTS6Qz-pr2qz2VROfNMjyVvzBlozlptoKFI8rt6tGJvRKTLhcMqPtq1UMNS4IwSQESoYb0QiTW8zWt6SZo4D2pUwAgoGAGNMQLMHYtlny1v7DjWrpLcO7cHKjnLDkdcGIw6qftmgSC4wmDWSMUiwCi0cas4ycarB-rSUbRyBkaj+VO+xgRJ02QB9JgoGiGFCOXxIVCYAYgN03293+8Pu8gVNU9NDTObyz27mV1YCrYmPsZz7M2RwKO6ezHJKWhHA8WjrAo3YRr2M6anOurxguSbGqatLqqhOB+AWCK+FQIjxDgbibM+9JIV8KGWgUsYYWWP68n+gxHPstZiA83pgbWmwyiBOxgcc+y0WYZHxAxTKAvkzGkeRsKgAA1u0EA4J03S9L4ShgGgUAQLJs4RkpFGAlRNHNCarTgB08K9LkAygLmOQFkWKkgEoTSCIQNgIHY-jEZqWjPm84b0TUyDoFgmB2HZq6BAA0mg5EIGAKAuXZUAIJ0ACqTAQMUmmAicXEALRuhVoT7AAKqEYiwNcsAKLs4S4LV5DPnZ7w5AEACSDk6X0eQ5rIeYecWz5AA',
    description: 'Test Solana counter program'
  },
  {
    name: 'CRUD Program',
    url:'https://app.testship.xyz/s#state=N4IglgJgNiBcoEMIQE4FMDOG4gEICtcUAmDANwDVcAVALwFZcBVAewGEB3AOQC0BrAOoBPABpCA5gFkAbAIBiEIXLIowARjRgADgJ4oAyuJAAaEAFs0AFyQJrcUADsEFnAGMUAVwgmQZNCgwwFgccAAYAOjVw0J8MLTRXMMjonwhMd21LIJDYEDZ0WzQIAAIOMEsAC2KAQQdXCpYUEABfUzAHDEtPVyzg7FgAbUdnNBwkCAB9fBYPFCcoCbQHLqFUsAwMs3bbRrgBtQAOaWMATgBmYwB2E6v6Y3pL42k7tWlj17UAXVMEV1cZ5b9IYgJwuXJaBBCfw+DiqawAIygo1gXQ8aFMgXEDmhKM8aFawzBIGms3mi2WKFWplh5QQiORqPRIC0EAQ9hAGDQRSBoD47W8uX+HUsPjICCgaL2alCamMamlcteioALHLiF8CSA+Q4BSBfv8PMsfBDKjgIVCmprtbqECgjKYTRUcFlLEiWp9mprQciOUJOmgzBMtCgWOIUM4fON0FgcPK4-GE4mkwn3T87TyQSNneU3aZLEJ4jhOqoHEYvVnBcFLEsRXmCz7i+0yx7jISfWkkdWpjM5uLySs1htVFsnJZdoM1PRjvRQqcLi8HqdHocDirvnq-gDLBnvWMPJVdtS4XS3bi0RiwFicYzTOgoLZskDiT2yTXKSAW22cCTews31SQBpBFTxvZlWXZTluT2Xl+TcPpa18cVJQnGVFVneV3jUVU1HVT8tVg3J9S3Y1bCdQj9waS1W3wnUxjtEjTVyF03WaD1WLTcQdwrEAJmY0Y60LXJG1Ld1yyJDwWUKbtST7f9B02bYxyaCc1AuV5VWVG5pGIYxlQuA41JObDLmIdciMNbdoMzIkEAow9AOPek4FAzFsWU0C7wfPo9mfGS-wpVY8N3XIf1fAKYUckC8QdcD4A5LkIAza04OFUUkORfZUPldClXlbDcKtAiNwNI0HVIvcDyomDaMI+iysYkA+NE9i9XTKzgp4pqBIbLomxaaiOuxDgJiFatSsa+si16kTWJa8zAXa7iACkX3FABRcLTAgdYFNHccBmIeg7kuYzl0uVdiGIZccN0956FMlr-BDAIrP+NI4GkUIvtMDq1rMLR82oHN+PMDAjFyIHXTQYpXAQBwHBYSxinhaGAwB1ZNTe5FPtQ6yfUhpFqBYFgABlgntUHwZAAnofWYoxxYYooHJ4oAAozAQAAPYozmIGGKltX5qwCABKfrQCxj6vp0vGcBpomWH0SiELMMG5eB4o6YZ4oMGVtmR2KNR+cFnp-DFzGWHe2AcYuWXcgASQcMUoEgGm2AF8NTZe0xVapx3ncgemNfqE3hewC2rZx1U7ZAP70bYKsax8X2cAT5YaxhuGEaRlHijR-NxZASXra+u4Y7TsbLAVsmRJ9tXcgrjOteJpmWfZrnDdCYhlWNz2w-N6ji5x45y8T5YFaVxoVfrvIx6R5vGd1qf9faQ3e6Fs3C6Hr7HhjpgnDs1RaCKZOZ+qTcLOKbPilsyqwGP7wWvzeIuKJFa-I2gduvZZKhNRHofAADMwBoCgIlRaRIuoTUEhyaaZYBrcVGknb+f8SzwK-ORSqPhn4+i0B4eEfA0AYwQUSdwaBCiTFsNgyauQwDSGVIXDqElWTVkoQhHBOA6EMNmrNNowpui9A6OycY0lfz9nfHFQBjQzAABFbBsjik1CGmAkbuC8DrFg94nDFGDKGcMZgfBIKNMozoMNPAlAwJouGCAdEhjDBGUwvFgbOhUX1H6aBhpGJFBDCodMtYqN1toYoUiUD0xURorRNjdH2NVsUfqxUtwYGqMgaMnJ+jAFaByS8bkMAAGkiEQjAC9eAmT7ydCYJJVhOBiBd3oAAWnlHU0I9BqChEuLAaUsBQgnHCPQA4lweAtEyULMAfhHbFg8D0bIYxkCiLCgOZoQA',
    description: 'Test Solana CRUD program'
  } 
];

const InitialTestModal = () => {
  const { handleVisit, hasVisited } = useHasVisited();
  const { idl } = useIDL();
  const [open, setOpen] = useState(false);
 
  const hasUrlHash = () => {
    const hash = window.location.hash;
    return hash && hash.includes('state=');
  };
 
  useEffect(() => {
    if (!hasUrlHash()) {
      setOpen(true);
    }
  }, [hasUrlHash]);

  const handleStartTesting = () => { 
    if (!idl) {
      const counterProgram = EXAMPLE_PROGRAMS.find(p => p.name === 'Counter Program');
      if (counterProgram) {
        window.location.href = counterProgram.url;
        return;
      }
    }
    
    handleVisit();
    setOpen(false);
  };

  const handleProgramLinkClick = (url: string) => {
    window.location.href = url;
  };
 
  if (hasVisited || hasUrlHash()) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Welcome to Testship</DialogTitle>   
          <DialogDescription>
            Get started by trying an example program or uploading your own IDL
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4"> 
          <div>
            <h3 className="text-sm font-semibold mb-3">Try Example Programs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXAMPLE_PROGRAMS.map((program, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex flex-col items-start h-auto p-4 hover:bg-accent"
                  onClick={() => handleProgramLinkClick(program.url)}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="font-medium whitespace-nowrap">{program.name}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="text-xs text-muted-foreground text-left whitespace-nowrap overflow-hidden text-ellipsis">
                    {program.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>
 
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
 
          <div>
            <h3 className="text-sm font-semibold mb-3">Upload Your Own IDL</h3>
            <CustomIDLModal />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="default" onClick={handleStartTesting}>
            Start Testing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}   

export default InitialTestModal