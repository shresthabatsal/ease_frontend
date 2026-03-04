"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type Store as IStore, useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Locate,
  Navigation,
  Store as StoreIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEAFLET_TILE_CSS = `.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden;outline:0}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-animated{-webkit-transform-origin:0 0;transform-origin:0 0}.leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform;-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;transition:none}.leaflet-container img.leaflet-tile{max-width:none!important;max-height:none!important}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-tile-pane{z-index:200}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both;position:relative;z-index:800;pointer-events:auto}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,.65);border-radius:4px}.leaflet-bar a,.leaflet-bar a:hover{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}.leaflet-grab{cursor:grab}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:grabbing}.leaflet-interactive{cursor:pointer}`;

function InjectLeafletCSS() {
  useEffect(() => {
    const id = "leaflet-css-injected";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = LEAFLET_TILE_CSS;
    document.head.appendChild(s);
  }, []);
  return null;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);
function resolveImg(path?: string) {
  if (!path) return undefined;
  if (path?.startsWith("http")) return path;
  return path ? `${API_BASE}/${path.replace(/^\//, "")}` : undefined;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// The Leaflet map
function StoresLeafletMap({
  stores,
  userPos,
  selectedId,
  onSelectStore,
}: {
  stores: IStore[];
  userPos: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelectStore: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  const cancelledRef = useRef(false);

  // Init map
  useEffect(() => {
    cancelledRef.current = false;

    import("leaflet").then((L) => {
      if (cancelledRef.current || !containerRef.current) return;

      if ((containerRef.current as any)._leaflet_id) {
        mapRef.current?.remove();
        mapRef.current = null;
        markersRef.current = new Map();
      }

      const center = stores[0]?.coordinates
        ? [stores[0].coordinates.latitude, stores[0].coordinates.longitude]
        : [27.7172, 85.324];

      const map = L.map(containerRef.current, {
        center: center as any,
        zoom: 13,
      });
      mapRef.current = map;
      // Forces Leaflet to recalculate container dimensions after CSS paint
      setTimeout(() => map.invalidateSize(), 50);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Store markers
      stores.forEach((store) => {
        if (!store.coordinates) return;
        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:32px;height:42px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))"><svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><path d="M16 0C8.268 0 2 6.268 2 14c0 9.6 14 28 14 28S30 23.6 30 14C30 6.268 23.732 0 16 0z" fill="#F6B60D" stroke="#d97706" stroke-width="1.5"/><circle cx="16" cy="14" r="5.5" fill="white" stroke="#d97706" stroke-width="1.5"/></svg></div>`,
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -44],
        });

        const marker = L.marker(
          [store.coordinates.latitude, store.coordinates.longitude],
          { icon }
        )
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;min-width:140px">
              <p style="font-weight:600;margin:0 0 4px">${store.storeName}</p>
              <p style="font-size:11px;color:#666;margin:0">${store.location}</p>
            </div>`,
            { maxWidth: 200 }
          )
          .on("click", () => onSelectStore(store._id));

        markersRef.current.set(store._id, marker);
      });

      // Fit to all stores
      if (stores.length > 1) {
        const bounds = stores
          .filter((s) => s.coordinates)
          .map(
            (s) =>
              [s.coordinates!.latitude, s.coordinates!.longitude] as [
                number,
                number
              ]
          );
        if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      cancelledRef.current = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = new Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user position marker
  useEffect(() => {
    if (!mapRef.current || !userPos) return;
    import("leaflet").then((L) => {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="background:#3b82f6;border-radius:50%;width:14px;height:14px;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
      } else {
        userMarkerRef.current = L.marker([userPos.lat, userPos.lng], {
          icon: userIcon,
        })
          .addTo(mapRef.current)
          .bindPopup("You are here");
      }
    });
  }, [userPos]);

  // Highlight selected store
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach((marker, id) => {
        const isSelected = id === selectedId;
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${
            isSelected ? "#000" : "#F6B60D"
          };color:${isSelected ? "#F6B60D" : "#000"};border-radius:50%;width:${
            isSelected ? 38 : 32
          }px;height:${
            isSelected ? 38 : 32
          }px;display:flex;align-items:center;justify-content:center;font-size:${
            isSelected ? 16 : 14
          }px;box-shadow:0 2px 8px rgba(0,0,0,${
            isSelected ? 0.4 : 0.2
          });border:2px solid white;transition:all 0.2s">🏪</div>`,
          iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
          iconAnchor: [isSelected ? 19 : 16, isSelected ? 19 : 16],
        });
        marker.setIcon(icon);
        if (isSelected) {
          const store = stores.find((s) => s._id === id);
          if (store?.coordinates) {
            mapRef.current.setView(
              [store.coordinates.latitude, store.coordinates.longitude],
              15,
              { animate: true }
            );
          }
          marker.openPopup();
        }
      });
    });
  }, [selectedId, stores]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 200 }}
    />
  );
}

function StoreCard({
  store,
  selected,
  distance,
  nearest,
  onClick,
}: {
  store: IStore;
  selected: boolean;
  distance?: number;
  nearest: boolean;
  onClick: () => void;
}) {
  const img = resolveImg(store.storeImage);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all",
        selected
          ? "border-amber-400 bg-amber-50 shadow-sm"
          : "border-slate-100 bg-white hover:border-amber-200"
      )}
    >
      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
        {img ? (
          <img
            src={img}
            alt={store.storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <StoreIcon size={18} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={cn(
              "text-sm font-semibold truncate",
              selected ? "text-slate-900" : "text-slate-800"
            )}
          >
            {store.storeName}
          </p>
          {nearest && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border border-green-200 font-medium">
              Nearest
            </Badge>
          )}
          {selected && (
            <CheckCircle2 size={13} className="text-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {store.location}
        </p>
        {distance !== undefined && (
          <p className="text-xs text-slate-500 mt-0.5">
            <Navigation size={9} className="inline mr-0.5" />
            {distance < 1
              ? `${Math.round(distance * 1000)}m away`
              : `${distance.toFixed(1)}km away`}
          </p>
        )}
      </div>
    </button>
  );
}

interface StoreMapViewProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function StoreMapView({
  open,
  onOpenChange,
}: StoreMapViewProps) {
  const { stores, selectedStore, setSelectedStore } = useStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [mapSelectedId, setMapSelectedId] = useState<string | null>(
    selectedStore?._id ?? null
  );

  const storesWithCoords = stores.filter((s: IStore) => s.coordinates);

  // Compute distances
  const distances = userPos
    ? Object.fromEntries(
        storesWithCoords.map((s) => [
          s._id,
          haversineKm(
            userPos.lat,
            userPos.lng,
            s.coordinates!.latitude,
            s.coordinates!.longitude
          ),
        ])
      )
    : {};

  const nearestId =
    userPos && storesWithCoords.length > 0
      ? storesWithCoords.reduce((a, b) =>
          (distances[a._id] ?? Infinity) < (distances[b._id] ?? Infinity)
            ? a
            : b
        )._id
      : null;

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // Auto-highlight nearest store
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }, []);

  // Auto-locate on open
  useEffect(() => {
    if (open && !userPos) handleLocateMe();
  }, [open]);

  const handleConfirm = () => {
    const store = stores.find((s) => s._id === mapSelectedId);
    if (store) setSelectedStore(store);
    onOpenChange(false);
  };

  const displayId = hoveredId ?? mapSelectedId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full rounded-2xl p-0 overflow-hidden gap-0 max-h-[90vh]">
        <InjectLeafletCSS />
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={16} className="text-amber-500" />
            Choose a store
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[520px] overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col">
            {/* Locate me */}
            <div className="p-3 border-b border-slate-100">
              <Button
                onClick={handleLocateMe}
                disabled={locating}
                variant="outline"
                size="sm"
                className="w-full rounded-xl gap-2 h-9"
              >
                {locating ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Locate size={13} />
                )}
                {locating ? "Locating…" : "Find nearest store"}
              </Button>
            </div>

            {/* Store list */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {storesWithCoords.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No stores with location data.
                </p>
              )}
              {storesWithCoords
                .slice()
                .sort(
                  (a, b) =>
                    (distances[a._id] ?? Infinity) -
                    (distances[b._id] ?? Infinity)
                )
                .map((store) => (
                  <StoreCard
                    key={store._id}
                    store={store}
                    selected={mapSelectedId === store._id}
                    distance={distances[store._id]}
                    nearest={nearestId === store._id && !!userPos}
                    onClick={() => setMapSelectedId(store._id)}
                  />
                ))}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            {open && storesWithCoords.length > 0 && (
              <StoresLeafletMap
                stores={storesWithCoords}
                userPos={userPos}
                selectedId={displayId}
                onSelectStore={setMapSelectedId}
              />
            )}
            {storesWithCoords.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No store locations to display.
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            {mapSelectedId
              ? `Selected: ${
                  stores.find((s) => s._id === mapSelectedId)?.storeName
                }`
              : "Click a store to select it"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!mapSelectedId}
              className="rounded-xl h-10 px-5 bg-amber-400 hover:bg-amber-500 text-black font-semibold gap-2 shadow-none"
            >
              <CheckCircle2 size={14} />
              Select store
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
