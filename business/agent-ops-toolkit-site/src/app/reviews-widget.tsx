"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Review = {
  id: string;
  created_at: string;
  rating: number;
  comment: string;
};

export default function ReviewsWidget() {
  const [loading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [avg, setAvg] = React.useState<number | null>(null);
  const [count, setCount] = React.useState(0);

  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(5);
  const [comment, setComment] = React.useState("");
  const [submitStatus, setSubmitStatus] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const j = await res.json();
      setReviews((j.reviews ?? []).slice(0, 6));
      setAvg(typeof j.avg === "number" ? j.avg : null);
      setCount(Number(j.count ?? 0));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function submit() {
    setSubmitStatus("Submitting…");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSubmitStatus(j.error ?? "Failed to submit");
      return;
    }
    setSubmitStatus("Thanks — review submitted.");
    setComment("");
    setRating(5);
    await load();
    setTimeout(() => setOpen(false), 500);
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>
            Reviews
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={avg ?? 0} precision={0.1} readOnly />
            <Typography sx={{ opacity: 0.8 }}>
              {avg ? avg.toFixed(1) : "—"} ({count})
            </Typography>
          </Stack>
        </Stack>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Leave a review
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {(loading ? Array.from({ length: 3 }).map((_, i) => ({ id: `s${i}`, rating: 0, comment: "Loading…", created_at: "" })) : reviews).map(
          (r: any) => (
            <Card key={r.id} variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Rating value={Number(r.rating) || 0} readOnly />
                  <Typography sx={{ opacity: 0.85, whiteSpace: "pre-wrap" }}>{r.comment}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ),
        )}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Leave a review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography sx={{ opacity: 0.8, mb: 0.5 }}>Star rating</Typography>
              <Rating value={rating} onChange={(_, v) => setRating(v)} />
            </Box>
            <TextField
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              multiline
              minRows={3}
              placeholder="What did Agent Ops Toolkit help you ship/fix?"
            />
            {submitStatus && <Typography sx={{ opacity: 0.75 }}>{submitStatus}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
