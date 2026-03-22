"use client";

import { useEffect } from "react";

export default function MapInit(props: { lat: number | null; lng: number | null; onPick: (lat: number, lng: number) => void; ready: boolean }) {
  useEffect(() => {
    if (!props.ready) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    const el = document.getElementById("map");
    if (!el) return;
    if ((el as any).__map) return; // init once

    const center = {
      lat: props.lat ?? 39.7392,
      lng: props.lng ?? -104.9903,
    };

    const map = new g.maps.Map(el, {
      center,
      zoom: 11,
      disableDefaultUI: true,
      gestureHandling: "greedy",
    });

    const marker = new g.maps.Marker({
      position: center,
      map,
      draggable: true,
    });

    map.addListener("click", (e: any) => {
      const p = e?.latLng;
      if (!p) return;
      marker.setPosition(p);
      props.onPick(p.lat(), p.lng());
    });

    marker.addListener("dragend", () => {
      const p = marker.getPosition();
      if (!p) return;
      props.onPick(p.lat(), p.lng());
    });

    (el as any).__map = map;
  }, [props.ready]);

  return null;
}
