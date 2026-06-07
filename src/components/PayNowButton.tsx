import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Props = {
  amount: number;
  itemName: string;
  email?: string;
  label?: string;
  className?: string;
};

/**
 * Calls the `initiate-paypack-checkout` edge function and redirects to the
 * Paypack-hosted payment page. The amount comes from the admin panel
 * (payment_links table), so admins fully control prices per service.
 */
export const PayNowButton = ({ amount, itemName, email, label = "Pay Now", className = "" }: Props) => {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("initiate-paypack-checkout", {
        body: {
          amount,
          item_name: itemName,
          email,
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancelled`,
        },
      });
      if (error) throw error;
      if (!data?.payment_link) throw new Error(data?.error ?? "No payment link returned");
      window.location.href = data.payment_link;
    } catch (e: any) {
      toast({
        title: "Payment could not be started",
        description: e?.message ?? "Please try again or contact us.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={pay}
          disabled={loading}
          className={
            className ||
            "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-gold/90 disabled:opacity-60"
          }
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          {label} · RWF {Number(amount).toLocaleString()}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Pay securely via Paypack (MTN MoMo / Airtel Money / card)</p>
      </TooltipContent>
    </Tooltip>
  );
};
