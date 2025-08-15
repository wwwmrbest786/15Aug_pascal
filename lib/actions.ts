"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function logActivity(
  supabase: any,
  userId: string,
  type: string,
  description: string,
  groupId?: string,
  betId?: string,
) {
  await supabase.from("transactions").insert({
    user_id: userId,
    bet_id: betId || null,
    amount: 0, // Activity logs have 0 amount
    type: type,
    description: description,
  })
}

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createServerClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }

  redirect("/home")
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const displayName = formData.get("displayName")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createServerClient()

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          display_name: displayName?.toString() || email.toString().split("@")[0],
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createServerClient()

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }

  redirect("/")
}

export async function createBet(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a bet" }
  }

  const groupId = formData.get("groupId")
  const title = formData.get("title")
  const description = formData.get("description")
  const category = formData.get("category") || "other"
  const originatorStake = formData.get("originatorStake")
  const minCounterStake = formData.get("minCounterStake")
  const biddingEnd = formData.get("biddingEnd")
  const resolutionDeadline = formData.get("resolutionDeadline")

  if (
    !groupId ||
    !title ||
    !description ||
    !originatorStake ||
    !minCounterStake ||
    !biddingEnd ||
    !resolutionDeadline
  ) {
    return { error: "All fields are required" }
  }

  try {
    const { data: bet, error } = await supabase
      .from("bets")
      .insert({
        group_id: groupId.toString(),
        originator_id: user.id,
        title: title.toString(),
        description: description.toString(),
        category: category.toString(),
        originator_stake: Number.parseInt(originatorStake.toString()),
        min_counter_stake: Number.parseInt(minCounterStake.toString()),
        bid_window_end: new Date(biddingEnd.toString()).toISOString(),
        resolution_deadline: new Date(resolutionDeadline.toString()).toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    await logActivity(supabase, user.id, "bet_create", `Started bet: ${title.toString()}`, groupId.toString(), bet.id)

    revalidatePath("/history")
  } catch (error) {
    console.error("Create bet error:", error)
    return { error: "Failed to create bet. Please try again." }
  }

  revalidatePath(`/group/${groupId}`)
  redirect(`/group/${groupId}`)
}

export async function handleAuthCallback(code: string) {
  const supabase = createServerClient()

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Auth callback error:", error)
    return { error: "Failed to confirm account" }
  }
}

export async function createBid(prevState: any, formData: FormData) {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Auth error in createBid:", userError)
      return { error: "Authentication failed. Please try logging in again." }
    }

    if (!user) {
      return { error: "You must be logged in to bid" }
    }

    const betId = formData.get("betId")
    const amount = formData.get("amount")

    if (!betId || !amount) {
      return { error: "Bet ID and amount are required" }
    }

    console.log("[v0] Creating bid for bet:", betId, "amount:", amount, "user:", user.id)

    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select("*, originator_id, bid_window_end, min_counter_stake, group_id")
      .eq("id", betId.toString())
      .single()

    if (betError) {
      console.error("[v0] Bet fetch error:", betError)
      return { error: "Failed to fetch bet details" }
    }

    if (!bet) {
      return { error: "Bet not found" }
    }

    if (bet.originator_id === user.id) {
      return { error: "You cannot bid on your own bet" }
    }

    if (new Date() > new Date(bet.bid_window_end)) {
      return { error: "Bidding window has closed" }
    }

    if (Number.parseInt(amount.toString()) < bet.min_counter_stake) {
      return { error: `Minimum bid is ${bet.min_counter_stake}` }
    }

    const { error } = await supabase.from("bids").insert({
      bet_id: betId.toString(),
      bidder_id: user.id,
      amount: Number.parseInt(amount.toString()),
      status: "active",
    })

    if (error) {
      console.error("[v0] Bid insert error:", error)
      return { error: error.message }
    }

    await logActivity(supabase, user.id, "bid_create", `Placed bid on: ${bet.title}`, bet.group_id, betId.toString())

    revalidatePath(`/group/${bet.group_id}`)
    revalidatePath("/history")

    console.log("[v0] Bid created successfully")
    return { success: "Bid placed successfully" }
  } catch (error) {
    console.error("[v0] Create bid error:", error)
    return { error: "Failed to place bid. Please try again." }
  }
}

export async function acceptBid(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to accept bids" }
  }

  const bidId = formData.get("bidId")

  if (!bidId) {
    return { error: "Bid ID is required" }
  }

  try {
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("*, bets(*)")
      .eq("id", bidId.toString())
      .single()

    if (bidError || !bid) {
      return { error: "Bid not found" }
    }

    if (bid.bets.originator_id !== user.id) {
      return { error: "Only the bet originator can accept bids" }
    }

    const { error: matchError } = await supabase.from("matches").insert({
      bet_id: bid.bet_id,
      originator_id: bid.bets.originator_id,
      counterparty_id: bid.bidder_id,
      originator_amount: bid.bets.originator_stake,
      counterparty_amount: bid.amount,
    })

    if (matchError) {
      return { error: matchError.message }
    }

    await supabase.from("bets").update({ state: "active" }).eq("id", bid.bet_id)

    await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId.toString())

    await supabase.from("bids").update({ status: "rejected" }).eq("bet_id", bid.bet_id).neq("id", bidId.toString())

    return { success: "Bid accepted successfully" }
  } catch (error) {
    console.error("Accept bid error:", error)
    return { error: "Failed to accept bid. Please try again." }
  }
}

export async function submitOutcome(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to submit outcome" }
  }

  const betId = formData.get("betId")
  const outcome = formData.get("outcome") // "true" for originator wins, "false" for counterparty wins
  const evidence = formData.get("evidence")

  if (!betId || outcome === null) {
    return { error: "Bet ID and outcome are required" }
  }

  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("bet_id", betId.toString())
      .single()

    if (matchError || !match) {
      return { error: "Match not found" }
    }

    if (match.originator_id !== user.id && match.counterparty_id !== user.id) {
      return { error: "You are not part of this bet" }
    }

    const { error } = await supabase.from("outcome_submissions").insert({
      bet_id: betId.toString(),
      submitted_by: user.id,
      value: outcome === "true",
      evidence: evidence?.toString() || "",
    })

    if (error) {
      return { error: error.message }
    }

    const { data: submissions } = await supabase.from("outcome_submissions").select("*").eq("bet_id", betId.toString())

    if (submissions && submissions.length === 2) {
      const agree = submissions[0].value === submissions[1].value
      if (agree) {
        const winnerIsOriginator = submissions[0].value
        await supabase
          .from("bets")
          .update({ state: winnerIsOriginator ? "originator_won" : "counterparty_won" })
          .eq("id", betId.toString())

        const { data: betDetails } = await supabase.from("bets").select("title").eq("id", betId.toString()).single()

        const winnerAmount = winnerIsOriginator
          ? match.originator_amount + match.counterparty_amount
          : match.counterparty_amount + match.originator_amount
        const loserId = winnerIsOriginator ? match.counterparty_id : match.originator_id
        const winnerId = winnerIsOriginator ? match.originator_id : match.counterparty_id

        await supabase.from("transactions").insert([
          {
            user_id: winnerId,
            bet_id: betId.toString(),
            amount: winnerAmount,
            type: "win",
            description: "Bet win",
          },
          {
            user_id: loserId,
            bet_id: betId.toString(),
            amount: -Math.min(match.originator_amount, match.counterparty_amount),
            type: "loss",
            description: "Bet loss",
          },
        ])

        await logActivity(
          supabase,
          winnerId,
          "bet_win",
          `Won bet: ${betDetails?.title || "Unknown"}`,
          undefined,
          betId.toString(),
        )
        await logActivity(
          supabase,
          loserId,
          "bet_loss",
          `Lost bet: ${betDetails?.title || "Unknown"}`,
          undefined,
          betId.toString(),
        )

        revalidatePath("/history")
      } else {
        await supabase.from("bets").update({ state: "disputed" }).eq("id", betId.toString())

        const { data: betDetails } = await supabase.from("bets").select("title").eq("id", betId.toString()).single()

        await logActivity(
          supabase,
          match.originator_id,
          "bet_dispute",
          `Bet disputed: ${betDetails?.title || "Unknown"}`,
          undefined,
          betId.toString(),
        )
        await logActivity(
          supabase,
          match.counterparty_id,
          "bet_dispute",
          `Bet disputed: ${betDetails?.title || "Unknown"}`,
          undefined,
          betId.toString(),
        )

        revalidatePath("/history")
      }
    }

    return { success: "Outcome submitted successfully" }
  } catch (error) {
    console.error("Submit outcome error:", error)
    return { error: "Failed to submit outcome. Please try again." }
  }
}

export async function joinGroup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to join a group" }
  }

  const inviteCode = formData.get("inviteCode")

  if (!inviteCode) {
    return { error: "Invite code is required" }
  }

  try {
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, name")
      .eq("invite_code", inviteCode.toString().toUpperCase())
      .single()

    if (groupError || !group) {
      return { error: "Invalid invite code" }
    }

    const { data: existingMembership } = await supabase
      .from("group_memberships")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single()

    if (existingMembership) {
      return { error: "You are already a member of this group" }
    }

    const { error } = await supabase.from("group_memberships").insert({
      group_id: group.id,
      user_id: user.id,
      role: "member",
      status: "active",
    })

    if (error) {
      return { error: error.message }
    }

    await logActivity(supabase, user.id, "group_join", `Joined group: ${group.name}`)

    revalidatePath("/history")

    return { success: "Successfully joined group", groupId: group.id }
  } catch (error) {
    console.error("Join group error:", error)
    return { error: "Failed to join group. Please try again." }
  }
}

export async function createGroup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a group" }
  }

  const name = formData.get("name")
  const description = formData.get("description")

  if (!name) {
    return { error: "Group name is required" }
  }

  try {
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let result = ""
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    let inviteCode = generateInviteCode()

    let { data: existing } = await supabase.from("groups").select("id").eq("invite_code", inviteCode).single()

    while (existing) {
      inviteCode = generateInviteCode()
      const { data } = await supabase.from("groups").select("id").eq("invite_code", inviteCode).single()
      existing = data
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: name.toString(),
        description: description?.toString() || "",
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      return { error: groupError.message }
    }

    const { error: membershipError } = await supabase.from("group_memberships").insert({
      group_id: group.id,
      user_id: user.id,
      role: "admin",
      status: "active",
    })

    if (membershipError) {
      return { error: membershipError.message }
    }

    await logActivity(supabase, user.id, "group_create", `Created group: ${name.toString()}`)

    revalidatePath("/home")
    revalidatePath("/history")
    return { success: "Group created successfully", groupId: group.id }
  } catch (error) {
    console.error("Create group error:", error)
    return { error: "Failed to create group. Please try again." }
  }
}

export async function exitGroup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to exit a group" }
  }

  const groupId = formData.get("groupId")

  if (!groupId) {
    return { error: "Group ID is required" }
  }

  try {
    const { data: group } = await supabase.from("groups").select("name").eq("id", groupId.toString()).single()

    const { data: membership, error: membershipError } = await supabase
      .from("group_memberships")
      .select("id, role")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (membershipError || !membership) {
      return { error: "You are not a member of this group" }
    }

    const { data: activeBets, error: betsError } = await supabase
      .from("bets")
      .select("id")
      .eq("group_id", groupId.toString())
      .eq("originator_id", user.id)
      .in("state", ["open", "active"])

    if (betsError) {
      return { error: "Failed to check active bets" }
    }

    if (activeBets && activeBets.length > 0) {
      return { error: "You cannot exit the group while you have active bets. Please resolve them first." }
    }

    const { data: activeBids, error: bidsError } = await supabase
      .from("bids")
      .select("id, bets!inner(group_id)")
      .eq("bidder_id", user.id)
      .eq("status", "pending")
      .eq("bets.group_id", groupId.toString())

    if (bidsError) {
      return { error: "Failed to check active bids" }
    }

    if (activeBids && activeBids.length > 0) {
      return { error: "You cannot exit the group while you have pending bids. Please cancel them first." }
    }

    const { error: deleteError } = await supabase
      .from("group_memberships")
      .delete()
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)

    if (deleteError) {
      return { error: deleteError.message }
    }

    await logActivity(supabase, user.id, "group_exit", `Left group: ${group?.name || "Unknown"}`)

    revalidatePath("/home")
    revalidatePath("/history")
  } catch (error) {
    console.error("Exit group error:", error)
    return { error: "Failed to exit group. Please try again." }
  }

  redirect("/home")
}

export async function settleBets(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to settle bets" }
  }

  const groupId = formData.get("groupId")

  if (!groupId) {
    return { error: "Group ID is required" }
  }

  try {
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("amount, bets!inner(group_id)")
      .eq("user_id", user.id)
      .eq("bets.group_id", groupId.toString())

    if (transactionsError) {
      return { error: "Failed to calculate balance" }
    }

    const currentBalance = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0

    if (currentBalance === 0) {
      return { error: "No outstanding balance to settle" }
    }

    const { error: settlementError } = await supabase.from("transactions").insert({
      user_id: user.id,
      bet_id: null,
      amount: -currentBalance,
      type: "settlement",
      description: currentBalance > 0 ? "Marked payment as received" : "Marked payment as sent",
    })

    if (settlementError) {
      return { error: settlementError.message }
    }

    revalidatePath(`/group/${groupId}`)
    return {
      success: currentBalance > 0 ? "Payment marked as received" : "Payment marked as sent",
    }
  } catch (error) {
    console.error("Settle bets error:", error)
    return { error: "Failed to settle bets. Please try again." }
  }
}

export async function closeBet(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to close a bet" }
  }

  const betId = formData.get("betId")

  if (!betId) {
    return { error: "Bet ID is required" }
  }

  try {
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select("id, title, originator_id, state, group_id")
      .eq("id", betId.toString())
      .single()

    if (betError || !bet) {
      return { error: "Bet not found" }
    }

    if (bet.originator_id !== user.id) {
      return { error: "Only the bet creator can close this bet" }
    }

    if (bet.state !== "open") {
      return { error: "Only open bets can be closed" }
    }

    const { data: bids, error: bidsError } = await supabase.from("bids").select("id").eq("bet_id", betId.toString())

    if (bidsError) {
      return { error: "Failed to check bids" }
    }

    if (bids && bids.length > 0) {
      return { error: "Cannot close bet with existing bids" }
    }

    const { error: updateError } = await supabase.from("bets").update({ state: "cancelled" }).eq("id", betId.toString())

    if (updateError) {
      return { error: updateError.message }
    }

    await logActivity(supabase, user.id, "bet_close", `Closed bet: ${bet.title}`, bet.group_id, betId.toString())

    revalidatePath(`/group/${bet.group_id}`)
    revalidatePath("/history")
    return { success: "Bet closed successfully" }
  } catch (error) {
    console.error("Close bet error:", error)
    return { error: "Failed to close bet. Please try again." }
  }
}

export async function updateGroup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to update a group" }
  }

  const groupId = formData.get("groupId")
  const name = formData.get("name")
  const description = formData.get("description")

  if (!groupId || !name) {
    return { error: "Group ID and name are required" }
  }

  try {
    const { data: membership, error: membershipError } = await supabase
      .from("group_memberships")
      .select("role")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (membershipError || !membership || membership.role !== "admin") {
      return { error: "Only group admins can update group settings" }
    }

    const { error: updateError } = await supabase
      .from("groups")
      .update({
        name: name.toString(),
        description: description?.toString() || "",
      })
      .eq("id", groupId.toString())

    if (updateError) {
      return { error: updateError.message }
    }

    await logActivity(supabase, user.id, "group_update", `Updated group: ${name.toString()}`)

    revalidatePath(`/group/${groupId}`)
    revalidatePath("/home")
    revalidatePath("/history")
    return { success: "Group updated successfully" }
  } catch (error) {
    console.error("Update group error:", error)
    return { error: "Failed to update group. Please try again." }
  }
}

export async function removeMember(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to remove members" }
  }

  const groupId = formData.get("groupId")
  const memberId = formData.get("memberId")

  if (!groupId || !memberId) {
    return { error: "Group ID and member ID are required" }
  }

  try {
    const { data: adminMembership, error: adminError } = await supabase
      .from("group_memberships")
      .select("role")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (adminError || !adminMembership || adminMembership.role !== "admin") {
      return { error: "Only group admins can remove members" }
    }

    const { data: memberDetails, error: memberError } = await supabase
      .from("group_memberships")
      .select("users(display_name, email)")
      .eq("group_id", groupId.toString())
      .eq("user_id", memberId.toString())
      .single()

    if (memberError || !memberDetails) {
      return { error: "Member not found" }
    }

    const { data: activeBets, error: betsError } = await supabase
      .from("bets")
      .select("id")
      .eq("group_id", groupId.toString())
      .eq("originator_id", memberId.toString())
      .in("state", ["open", "active"])

    if (betsError) {
      return { error: "Failed to check member's active bets" }
    }

    if (activeBets && activeBets.length > 0) {
      return { error: "Cannot remove member with active bets. Ask them to resolve their bets first." }
    }

    const { error: removeError } = await supabase
      .from("group_memberships")
      .delete()
      .eq("group_id", groupId.toString())
      .eq("user_id", memberId.toString())

    if (removeError) {
      return { error: removeError.message }
    }

    const memberName = memberDetails.users?.display_name || memberDetails.users?.email || "Unknown"
    await logActivity(supabase, user.id, "member_remove", `Removed member: ${memberName}`)

    revalidatePath(`/group/${groupId}`)
    revalidatePath("/history")
    return { success: `Successfully removed ${memberName} from the group` }
  } catch (error) {
    console.error("Remove member error:", error)
    return { error: "Failed to remove member. Please try again." }
  }
}

export async function deleteGroup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to delete a group" }
  }

  const groupId = formData.get("groupId")

  if (!groupId) {
    return { error: "Group ID is required" }
  }

  try {
    const { data: membership, error: membershipError } = await supabase
      .from("group_memberships")
      .select("role")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (membershipError || !membership || membership.role !== "admin") {
      return { error: "Only group admins can delete the group" }
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId.toString())
      .single()

    if (groupError || !group) {
      return { error: "Group not found" }
    }

    const { data: activeBets, error: betsError } = await supabase
      .from("bets")
      .select("id, title, state")
      .eq("group_id", groupId.toString())
      .in("state", ["open", "active"])

    if (betsError) {
      return { error: "Failed to check active bets" }
    }

    if (activeBets && activeBets.length > 0) {
      return {
        error: `Cannot delete group with ${activeBets.length} open or active bets. Please close or resolve all active bets first.`,
      }
    }

    // Delete outcome submissions first
    await supabase
      .from("outcome_submissions")
      .delete()
      .in("bet_id", supabase.from("bets").select("id").eq("group_id", groupId.toString()))

    // Delete transactions related to group bets
    await supabase
      .from("transactions")
      .delete()
      .in("bet_id", supabase.from("bets").select("id").eq("group_id", groupId.toString()))

    // Delete matches
    await supabase
      .from("matches")
      .delete()
      .in("bet_id", supabase.from("bets").select("id").eq("group_id", groupId.toString()))

    // Delete bids
    await supabase
      .from("bids")
      .delete()
      .in("bet_id", supabase.from("bets").select("id").eq("group_id", groupId.toString()))

    // Delete bets (including closed/cancelled ones)
    await supabase.from("bets").delete().eq("group_id", groupId.toString())

    // Delete group memberships
    await supabase.from("group_memberships").delete().eq("group_id", groupId.toString())

    // Finally delete the group
    const { error: deleteError } = await supabase.from("groups").delete().eq("id", groupId.toString())

    if (deleteError) {
      return { error: deleteError.message }
    }

    await logActivity(supabase, user.id, "group_delete", `Deleted group: ${group.name}`)

    revalidatePath("/home")
    revalidatePath("/history")
    redirect("/home")
  } catch (error) {
    console.error("Delete group error:", error)
    return { error: "Failed to delete group. Please try again." }
  }
}
