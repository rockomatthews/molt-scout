"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

export function UiHighlights() {
  const [snackOpen, setSnackOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Typography variant="h6" fontWeight={900}>
        UI highlights (Material UI)
      </Typography>
      <Typography sx={{ opacity: 0.8, mt: 0.5 }}>
        This is the kind of polished, interactive UI we ship for small businesses: clean layouts, real components, and a
        professional feel.
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        <Chip label="Accordions" variant="outlined" />
        <Chip label="Dialogs" variant="outlined" />
        <Chip label="Snackbars" variant="outlined" />
        <Chip label="Steppers" variant="outlined" />
        <Chip label="Alerts" variant="outlined" />
      </Stack>

      <Divider sx={{ opacity: 0.12, my: 2 }} />

      <Alert severity="info" variant="outlined">
        Example: a customer action triggers a confirmation message (no weird page reloads).
      </Alert>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
        <Button variant="contained" onClick={() => setSnackOpen(true)} sx={{ textTransform: "none" }}>
          Show confirmation
        </Button>
        <Button variant="outlined" onClick={() => setDialogOpen(true)} sx={{ textTransform: "none" }}>
          Open quote dialog
        </Button>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography fontWeight={900} sx={{ mb: 1 }}>
          Typical client flow
        </Typography>
        <Stepper alternativeLabel>
          <Step>
            <StepLabel>Pick a package</StepLabel>
          </Step>
          <Step>
            <StepLabel>We build the site</StepLabel>
          </Step>
          <Step>
            <StepLabel>Launch + updates</StepLabel>
          </Step>
        </Stepper>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography fontWeight={900} sx={{ mb: 1 }}>
          FAQ (accordion)
        </Typography>
        <Accordion>
          <AccordionSummary>
            <Typography fontWeight={800}>Do you handle edits after launch?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ opacity: 0.85 }}>
              Yes. We can do ongoing updates, seasonal promos, new pages, and conversion tweaks.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography fontWeight={800}>Can you make it match my brand?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ opacity: 0.85 }}>
              Yes. Fonts, colors, spacing, imagery, and tone—so the site feels premium and consistent.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        message="Saved. We’ll email you the next steps."
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Get a quote</DialogTitle>
        <DialogContent>
          <Typography sx={{ opacity: 0.85 }}>
            This is an example of a clean, on-brand quote/request flow we can embed directly into your site.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Looks good
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
