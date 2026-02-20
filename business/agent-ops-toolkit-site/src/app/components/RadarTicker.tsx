"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Item = {
  id: string;
  symbol: string;
  name?: string | null;
  post_url?: string | null;
  trade_url?: string | null;
  note?: string | null;
};

function TickerItem({
  item,
  onOpen,
}: {
  item: Item;
  onOpen: (i: Item) => void;
}) {
  return (
    <Button
      onClick={() => onOpen(item)}
      variant="text"
      color="inherit"
      sx={{
        textTransform: "none",
        borderRadius: 999,
        px: 1.25,
        py: 0.5,
        whiteSpace: "nowrap",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(15,22,36,0.6)",
      }}
    >
      <Typography fontWeight={900} sx={{ mr: 1 }}>
        {item.symbol}
      </Typography>
      <Typography sx={{ opacity: 0.8 }}>{item.name ?? "Launch"}</Typography>
    </Button>
  );
}

export default function RadarTicker() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Item | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/radar", { cache: "no-store" });
      const j = await res.json().catch(() => ({ items: [] }));
      setItems(j.items ?? []);
    })();
  }, []);

  const openItem = (i: Item) => {
    setActive(i);
    setOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(11,15,23,0.55)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            py: 1,
            px: 2,
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <Typography sx={{ opacity: 0.75, fontWeight: 800, mr: 1 }}>
            3 launches worth watching:
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              flex: 1,
              pr: 2,
            }}
          >
            {items.length ? (
              items.map((i) => <TickerItem key={i.id} item={i} onOpen={openItem} />)
            ) : (
              <Typography sx={{ opacity: 0.6 }}>No picks yet (daily update pending)</Typography>
            )}
          </Box>

          <Button href="/waitlist" variant="contained" size="small" sx={{ borderRadius: 999 }}>
            Join waitlist
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          {active?.symbol} {active?.name ? `— ${active.name}` : ""}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography sx={{ opacity: 0.85, whiteSpace: "pre-wrap" }}>
              {active?.note ?? "No note yet."}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {active?.post_url && (
                <Button href={active.post_url} target="_blank" rel="noreferrer" variant="outlined">
                  View post
                </Button>
              )}
              {active?.trade_url && (
                <Button href={active.trade_url} target="_blank" rel="noreferrer" variant="contained">
                  Trade
                </Button>
              )}
            </Stack>
            <Typography sx={{ opacity: 0.65, fontSize: 13 }}>
              Tip: click outside this box or hit X to return to the page.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
