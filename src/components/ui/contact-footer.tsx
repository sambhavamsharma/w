"use client";

import Image from "next/image";
import { Check, MapPin, MessageCircle, Phone } from "lucide-react";

import { brandmark } from "@/data/slides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Where enquiries go. Both numbers are the customer-care lines printed on the
 * bottle; the first one also takes WhatsApp. Swap in a real inbox here if the
 * brand gets one — everything below reads from this object.
 */
const CONTACT = {
  company: "Washela Consumer Products",
  address: "Plot no. 174, Salumbre, Hinjewadi Road, Pune",
  phones: [
    { display: "97667 06233", tel: "+919766706233" },
    { display: "78094 42233", tel: "+917809442233" },
  ],
  /** International format, digits only — the shape wa.me wants. */
  whatsapp: "919766706233",
} as const;

const POINTS = [
  "Ask about hand wash, dish wash or floor cleaner",
  "Bulk and trade enquiries are welcome",
  "Tell us the scent you're after — citrus, tea tree, lavender…",
];

/** Form values, read off the submitted <form> rather than tracked in state. */
const field = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();

/**
 * The closing section. Submitting composes the enquiry as a WhatsApp message
 * to the customer-care line — there is no backend to post to, so nothing is
 * stored; the visitor sends it themselves from WhatsApp.
 */
export function ContactFooter() {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const lines = [
      `Hi Washela! I'm ${field(data, "name")}.`,
      `I'm a ${field(data, "who")} and I'm interested in ${field(data, "interest")}.`,
      field(data, "message"),
      `You can reach me on ${field(data, "phone")}.`,
    ].filter(Boolean);

    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer
      id="contact"
      // Pulled up a screen so it rises over the Range page's pinned frame
      // (the white the curtain leaves behind) instead of waiting for that to
      // scroll away first, and at least a screen tall so it fully covers it.
      className="theme-light relative z-10 -mt-[100vh] flex min-h-screen w-full flex-col justify-center supports-[height:100dvh]:-mt-[100dvh] supports-[height:100dvh]:min-h-dvh"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-8">
            <p className="text-muted-foreground text-sm font-light">
              Contact / <span className="text-foreground">Say hello</span>
            </p>
            <h2 className="text-5xl leading-[1.02] font-light tracking-tighter sm:text-6xl">
              Contact us
            </h2>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              Questions, bulk orders, or just picking a scent? Say hi.
            </p>

            <ul className="space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <Check className="bg-secondary text-primary h-6 w-6 shrink-0 rounded-full p-1.5" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>

            <div className="grid gap-6 pt-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Customer care
                </h3>
                <div className="text-muted-foreground space-y-1 text-sm">
                  {CONTACT.phones.map((phone) => (
                    <a
                      key={phone.tel}
                      href={`tel:${phone.tel}`}
                      className="hover:text-foreground block underline-offset-4 transition-colors hover:underline"
                    >
                      {phone.display}
                    </a>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Find us
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {CONTACT.company}
                  <br />
                  {CONTACT.address}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="border-border space-y-6 rounded-xl border bg-[#faf8fd] p-6 sm:p-10"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-name">Your name</Label>
                <Input
                  id="cf-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Riya"
                  className="mt-2 bg-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cf-phone">Phone</Label>
                <Input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="98xxx xxxxx"
                  className="mt-2 bg-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cf-who">I&apos;m a</Label>
                <Select name="who" required>
                  <SelectTrigger id="cf-who" className="mt-2 w-full bg-white">
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular customer">Home user</SelectItem>
                    <SelectItem value="shop or retailer">
                      Shop / retailer
                    </SelectItem>
                    <SelectItem value="business or hotel">
                      Business / hotel
                    </SelectItem>
                    <SelectItem value="curious human">Just curious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cf-interest">Interested in</Label>
                <Select name="interest" required>
                  <SelectTrigger
                    id="cf-interest"
                    className="mt-2 w-full bg-white"
                  >
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hand wash">Hand wash</SelectItem>
                    <SelectItem value="dish wash">Dish wash</SelectItem>
                    <SelectItem value="floor cleaner">Floor cleaner</SelectItem>
                    <SelectItem value="the whole range">
                      The whole range
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="cf-message">Anything else? (optional)</Label>
              <Textarea
                id="cf-message"
                name="message"
                placeholder="Scent you like, quantity, questions…"
                className="mt-2 h-28 bg-white [resize:none]"
              />
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Send on WhatsApp
            </Button>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This opens WhatsApp with your message ready to go — nothing is
              sent until you hit send there.
            </p>
          </form>
        </div>

        <div className="border-border mt-20 flex flex-col items-start justify-between gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <Image
            src={brandmark.image}
            alt={brandmark.alt}
            className="h-6 w-auto opacity-90 brightness-0"
            sizes="120px"
            draggable={false}
          />
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} {CONTACT.company}. Made gentle,
            scented for the quiet part of the day.
          </p>
        </div>
      </div>
    </footer>
  );
}
