import { CancelProps } from "../utils/types.ts";
import { useState } from "react";
import Container from "./Container.tsx";
import Subheading from "./Subheading.tsx";
import Button from "./Button.tsx";

export default function CancelBooking({onCancel}: CancelProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const message = await onCancel(code.trim());
      setResult(message);
      setCode("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <Container>
            <>
            <Subheading>Cancel a booking</Subheading>

            <input
                value={code}
                onChange={e => setCode(e.target.value)}
                className="bg-zinc-100 border-b-2 p-2"
            />

            <Button onClick={handleCancel}>Cancel Booking</Button>
            {loading && <p>Canceling...</p>}
            {result && <p>{result}</p>}
        </>
        </Container>
    </>
  );
};
