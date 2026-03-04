"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Locate, Search, Loader2 } from "lucide-react";

export interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialValue?: LatLng;
  onConfirm: (latlng: LatLng, label: string) => void;
}

const DEFAULT: LatLng = { lat: 27.7172, lng: 85.324 };

const PIN_SVG = `
  <div style="position:relative;width:28px;height:38px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">
    <svg viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 24 14 24S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#F6B60D"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  </div>`;

const LEAFLET_CSS = `
.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane > svg,.leaflet-pane > canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}
.leaflet-container{overflow:hidden;outline:0;font:12px/1.5 "Helvetica Neue",Arial,Helvetica,sans-serif}
.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}
.leaflet-tile::selection{background:0 0}
.leaflet-tile-loaded{visibility:inherit}
.leaflet-zoom-box{width:0;height:0;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:800}
.leaflet-overlay-pane{z-index:400}
.leaflet-shadow-pane{z-index:500}
.leaflet-marker-pane{z-index:600}
.leaflet-tooltip-pane{z-index:650}
.leaflet-popup-pane{z-index:700}
.leaflet-map-pane canvas{z-index:100}
.leaflet-map-pane svg{z-index:200}
.leaflet-tile-pane{z-index:200}
.leaflet-vml-shape{width:1px;height:1px}
.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}
.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}
.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}
.leaflet-top{top:0}
.leaflet-right{right:0}
.leaflet-bottom{bottom:0}
.leaflet-left{left:0}
.leaflet-control{float:left;clear:both}
.leaflet-right .leaflet-control{float:right}
.leaflet-top .leaflet-control{margin-top:10px}
.leaflet-bottom .leaflet-control{margin-bottom:10px}
.leaflet-left .leaflet-control{margin-left:10px}
.leaflet-right .leaflet-control{margin-right:10px}
.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity .2s linear;-moz-transition:opacity .2s linear;transition:opacity .2s linear}
.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}
.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}
.leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform;-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}
.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}
.leaflet-zoom-anim .leaflet-zoom-animated.leaflet-retrieve{-webkit-transition:none;-moz-transition:none;transition:none}
.leaflet-container img.leaflet-tile{max-width:none!important;max-height:none!important}
.leaflet-container img{padding:0;margin:0}
.leaflet-tile{filter:inherit;visibility:hidden}
.leaflet-tile-loaded{visibility:inherit}
.leaflet-marker-icon,.leaflet-marker-shadow{display:block}
.leaflet-container{-webkit-tap-highlight-color:transparent}
.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,.4)}
.leaflet-tile{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}
.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}
.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}
.leaflet-popup-pane,.leaflet-control{cursor:auto}
.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}
.leaflet-interactive{cursor:pointer}
.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,.65);border-radius:4px}
.leaflet-bar a,.leaflet-bar a:hover{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}
.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}
.leaflet-bar a:hover{background-color:#f4f4f4}
.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}
.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}
.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}
.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}
.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}
.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}
.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}
.leaflet-touch .leaflet-control-zoom-in{font-size:22px}
.leaflet-touch .leaflet-control-zoom-out{font-size:20px}
.leaflet-control-attribution{background:#fff;background:rgba(255,255,255,.7);margin:0}
.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333}
.leaflet-control-attribution a{text-decoration:none}
.leaflet-control-attribution a:hover{text-decoration:underline}
.leaflet-container .leaflet-control-attribution{background-color:#ffffffbb;font-size:10px}
.leaflet-left .leaflet-control-scale{margin-left:5px}
.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}
.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;font-size:11px;white-space:nowrap;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box;background:#fff;background:rgba(255,255,255,.5)}
.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}
.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}
.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{box-shadow:none}
.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}
.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}
.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px;background:white;box-shadow:0 3px 14px rgba(0,0,0,.4)}
.leaflet-popup-content{margin:13px 19px;line-height:1.4}
.leaflet-popup-content p{margin:18px 0}
.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}
.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);background:white;box-shadow:0 3px 14px rgba(0,0,0,.4)}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:white;color:#333;box-shadow:0 3px 14px rgba(0,0,0,.4)}
.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;padding:4px 4px 0 0;border:none;text-align:center;width:18px;height:14px;font:16px/14px Tahoma,Verdana,sans-serif;color:#c3c3c3;text-decoration:none;font-weight:700;background:0 0}
.leaflet-container a.leaflet-popup-close-button:hover{color:#999}
.leaflet-popup-scrolled{overflow:auto;border-bottom:1px solid #ddd;border-top:1px solid #ddd}
.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}
.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto;-ms-filter:"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)";filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)}
.leaflet-oldie .leaflet-popup-tip-container{margin-top:-1px}
.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}
.leaflet-div-icon{background:#fff;border:1px solid #666}
`;

function InjectLeafletCSS() {
  useEffect(() => {
    const id = "leaflet-inline-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = LEAFLET_CSS;
    document.head.appendChild(style);
    return () => {};
  }, []);
  return null;
}

// Leaflet map
function LeafletMap({
  pin,
  onPinChange,
}: {
  pin: LatLng;
  onPinChange: (p: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    import("leaflet").then((L) => {
      if (cancelledRef.current || !containerRef.current) return;

      if ((containerRef.current as any)._leaflet_id) {
        mapRef.current?.remove();
        mapRef.current = null;
        markerRef.current = null;
      }

      const pinIcon = L.divIcon({
        html: PIN_SVG,
        className: "",
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -40],
      });

      const map = L.map(containerRef.current, {
        center: [pin.lat, pin.lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([pin.lat, pin.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);
      mapRef.current = map;
      markerRef.current = marker;

      setTimeout(() => map.invalidateSize(), 50);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onPinChange({ lat: p.lat, lng: p.lng });
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        onPinChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    });

    return () => {
      cancelledRef.current = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to external pin changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([pin.lat, pin.lng]);
    mapRef.current.setView([pin.lat, pin.lng], mapRef.current.getZoom(), {
      animate: true,
    });
  }, [pin.lat, pin.lng]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 320 }}
    />
  );
}

export default function LocationPicker({
  open,
  onOpenChange,
  initialValue,
  onConfirm,
}: LocationPickerProps) {
  const [pin, setPin] = useState<LatLng>(initialValue ?? DEFAULT);
  const [label, setLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) {
      setPin(initialValue ?? DEFAULT);
      setLabel("");
      setSearchQuery("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reverse geocode
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pin.lat}&lon=${pin.lng}&format=json`,
          { headers: { "Accept-Language": "en" } }
        );
        const d = await r.json();
        setLabel(
          d.display_name ?? `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`
        );
      } catch {
        setLabel(`${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [pin.lat, pin.lng]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          q
        )}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const d = await r.json();
      if (d[0]) {
        setPin({ lat: +d[0].lat, lng: +d[0].lon });
        setLabel(d[0].display_name);
      }
    } catch {
      /* silent */
    } finally {
      setSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPin({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl rounded-2xl p-0 gap-0"
        style={{ overflow: "hidden", zIndex: 9999 }}
      >
        <InjectLeafletCSS />

        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MapPin size={16} className="text-amber-500" />
            Pick a location
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3 flex gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search address or place…"
              className="pl-8 h-9 rounded-xl border-slate-200 text-sm"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching}
            size="sm"
            variant="outline"
            className="rounded-xl h-9 px-3 gap-1.5"
          >
            {searching ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Search size={13} />
            )}
            Search
          </Button>
          <Button
            onClick={handleLocateMe}
            disabled={locating}
            size="sm"
            variant="outline"
            className="rounded-xl h-9 w-9 p-0"
            title="Use my location"
          >
            {locating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Locate size={13} />
            )}
          </Button>
        </div>

        {/* Map wrapper */}
        <div style={{ position: "relative", height: 340, flexShrink: 0 }}>
          {open && <LeafletMap pin={pin} onPinChange={setPin} />}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.92)",
              fontSize: 11,
              color: "#64748b",
              padding: "4px 12px",
              borderRadius: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,.12)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 400,
            }}
          >
            Click the map or drag the pin
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 12px",
              background: "#f8fafc",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              marginBottom: 12,
            }}
          >
            <MapPin
              size={14}
              color="#F6B60D"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Selected location
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#334155",
                  marginTop: 2,
                  wordBreak: "break-word",
                }}
              >
                {label || "Loading address…"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#94a3b8",
                  marginTop: 2,
                }}
              >
                {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm(pin, label);
                onOpenChange(false);
              }}
              className="rounded-xl h-10 px-5 bg-amber-400 hover:bg-amber-500 text-black font-semibold gap-2 shadow-none"
            >
              <MapPin size={14} />
              Confirm location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
