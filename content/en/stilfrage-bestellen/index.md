---
title: "Order your style question"
seoTitle: "Order your style question | Process & booking | ESKYNA"
description: "Book your style question with Natalia: after submitting, choose a photo reply or a live shopping check and pay securely via Stripe."
type: stilfrage-bestellen
layout: single
url: /en/style-question/order/
aliases:
  - /en/stilfrage/bestellen/
  - /style-question/order/

back:
  href: /en/style-question/
  label: Back to style question

order:
  kicker: ESKYNA Style Question
  headline: "Clarity you can feel."
  lead: "You have submitted your style question. Next, choose the format that fits and reserve Natalia's assessment."
  price: "from €49"
  price_note: "depending on format"
  secondary_cta:
    href: /en/style-question/
    text: Submit your question first
  checkout_kicker: Secure booking
  checkout_title: "Choose your format"
  checkout_text: "Two clear paths to a decision. Payment is handled securely via Stripe."
  fallback_cta:
    href: /en/style-question/
    text: Haven't submitted a question yet? Start here

options:
  title: Your two options
  intro: "Choose the format that fits your moment."
  items:
    - id: foto
      label: A
      title: Style answer by photo or message
      price: from €49
      text: "You have already sent your question, photo, or options. Natalia replies with a clear assessment and a short explanation."
      includes:
        - Personal answer to your specific question
        - Assessment of color, cut, proportion, style, or impact
        - "Clear recommendation: buy, keep, combine differently, or leave it"
        - Brief explanation of why something works or does not work
      stripe:
        enabled: false
        checkout_url: ""
        button_text: "Book photo reply"
    - id: live
      label: B
      title: Live shopping check
      price: from €79
      text: "For the moment in store or before buying: Natalia looks with you live and helps you decide with confidence."
      note: "Subject to availability and a booked time slot."
      includes:
        - Short live consultation by video or call
        - Assessment of pieces you are currently trying on
        - Direct decision support
        - Advice on what to watch for when buying
      stripe:
        enabled: false
        checkout_url: ""
        button_text: "Book live check"

stripe:
  enabled: false
  pending_text: "Secure Stripe checkout will be available shortly."
  secure_note: "Secure payment via Stripe. You will receive all details by email."

process:
  title: How your style question unfolds
  intro: "Five clear steps. You always know where you are and what comes next."
  steps:
    - title: Submit your style question
      status: done
      status_label: Completed
      text: "You have sent Natalia your concrete question, photos, or options. The starting point is clear."
      link:
        href: /en/style-question/
        label: Review or add to your question
    - title: Choose format and pay
      status: current
      status_label: Next
      text: "Secure Natalia's assessment. Choose between a style answer by photo or message and the live shopping check."
      show_options: true
    - title: Natalia takes on your request
      text: "Depending on the format: Natalia works with your materials - or your live time slot is confirmed."
    - title: Clear assessment
      text: "You receive a concrete recommendation with reasoning: in writing or live in conversation."
    - title: A confident decision
      text: "You know what suits you - and can buy, keep, or leave it without doubt."

assurance:
  title: Why clients choose this path
  text: "Because good style decisions rarely happen alone in a fitting room. They happen in dialogue."
  items:
    - title: Personal
      text: "Natalia does not answer generically. She responds to your situation, your body, and your everyday life."
    - title: Binding
      text: "You book a clear format with a price - not just a message into the void."
    - title: Calm and refined
      text: "No pressure, no trend noise. Clarity that helps you decide with more confidence."
---
