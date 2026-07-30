// @ts-nocheck
"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

function CardRotate({ children, onSendToBack, sensitivity }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_, info) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

/**
 * Kąt przechylenia karty wyliczony z jej identyfikatora — zawsze ten sam dla tego
 * samego id, w zakresie −5°…+5°.
 *
 * Wcześniej był tu `Math.random()` wywoływany wprost w renderze. Strona renderuje
 * się dwa razy — na serwerze do HTML-a i ponownie w przeglądarce przy hydratacji —
 * a losowanie dawało za każdym razem inny kąt. React porównywał oba wyniki i
 * zgłaszał: "A tree hydrated but some attributes of the server rendered HTML
 * didn't match the client properties".
 *
 * Skutkiem ubocznym była też drobna wada wizualna: kąty losowały się od nowa przy
 * każdym przerenderowaniu, więc karty drgały np. po odłożeniu jednej na spód.
 * Teraz każda karta ma swój stały kąt.
 */
function rotationFromId(id) {
  const s = String(id);
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // wymieszanie bitów, żeby sąsiednie id (1, 2, 3…) dawały różne kąty
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (((h >>> 0) % 1000) / 1000) * 10 - 5;
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cardDimensions = { width: 208, height: 208 },
  sendToBackOnClick = false,
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
}) {
  const [cards, setCards] = useState(cardsData);

  const sendToBack = (id) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  return (
    <div
      className="relative select-none"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        perspective: 600,
      }}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation ? rotationFromId(card.id) : 0;

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            <motion.div
              className="rounded-2xl overflow-hidden border border-sr-line shadow-xl bg-white"
              onClick={() => sendToBackOnClick && sendToBack(card.id)}
              animate={{
                rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: "90% 90%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
              }}
            >
              <img
                src={card.img}
                alt={card.alt || "Zdjęcie ze stosu"}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
