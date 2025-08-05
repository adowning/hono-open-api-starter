import { Response } from 'express';

// API Error Codes (AEC) from errcodes.go
export enum AEC {
	AECnull = 0,
	AEC_auth_absent,
	AEC_auth_scheme,
	AEC_basic_decode,
	AEC_basic_nouser,
	AEC_basic_deny,
	AEC_token_nouser,
	AEC_token_malform,
	AEC_token_notsign,
	AEC_token_badclaims,
	AEC_token_expired,
	AEC_token_notyet,
	AEC_token_issuer,
	AEC_token_error,
	AEC_nourl,
	AEC_nomethod,
	AEC_signis_nobind,
	AEC_signis_nouid,
	AEC_signis_noemail,
	AEC_sendcode_nobind,
	AEC_sendcode_nouser,
	AEC_sendcode_update,
	AEC_sendcode_code,
	AEC_activate_nobind,
	AEC_activate_nouser,
	AEC_activate_oldcode,
	AEC_activate_badcode,
	AEC_activate_update,
	AEC_signup_nobind,
	AEC_signup_smallsec,
	AEC_signup_code,
	AEC_signup_sql,
	AEC_signin_nobind,
	AEC_signin_nosecret,
	AEC_signin_smallsec,
	AEC_signin_nouser,
	AEC_signin_activate,
	AEC_signin_oldcode,
	AEC_signin_badcode,
	AEC_signin_denypass,
	AEC_signin_sigtime,
	AEC_signin_timeout,
	AEC_signin_hs256,
	AEC_signin_denyhash,
	AEC_game_new_nobind,
	AEC_game_new_noclub,
	AEC_game_new_nouser,
	AEC_game_new_noaccess,
	AEC_game_new_noalias,
	AEC_game_new_sql,
	AEC_game_list_nobind,
	AEC_game_list_inc,
	AEC_game_list_exc,
	AEC_game_join_nobind,
	AEC_game_join_nouser,
	AEC_game_join_noaccess,
	AEC_game_join_noscene,
	AEC_game_info_nobind,
	AEC_game_info_noscene,
	AEC_game_info_nouser,
	AEC_game_info_noaccess,
	AEC_game_info_noprops,
	AEC_game_rtpget_nobind,
	AEC_game_rtpget_noscene,
	AEC_game_rtpget_noinfo,
	AEC_game_rtpget_noclub,
	AEC_game_rtpget_nouser,
	AEC_game_rtpget_noaccess,
	AEC_slot_betget_nobind,
	AEC_slot_betget_noscene,
	AEC_slot_betget_notslot,
	AEC_slot_betget_noaccess,
	AEC_slot_betset_nobind,
	AEC_slot_betset_noscene,
	AEC_slot_betset_notslot,
	AEC_slot_betset_noaccess,
	AEC_slot_betset_badbet,
	AEC_slot_selget_nobind,
	AEC_slot_selget_noscene,
	AEC_slot_selget_notslot,
	AEC_slot_selget_noaccess,
	AEC_slot_selset_nobind,
	AEC_slot_selset_noscene,
	AEC_slot_selset_notslot,
	AEC_slot_selset_noaccess,
	AEC_slot_selset_badsel,
	AEC_slot_modeset_nobind,
	AEC_slot_modeset_noscene,
	AEC_slot_modeset_notslot,
	AEC_slot_modeset_noaccess,
	AEC_slot_modeset_badmode,
	AEC_slot_spin_nobind,
	AEC_slot_spin_noscene,
	AEC_slot_spin_notslot,
	AEC_slot_spin_noclub,
	AEC_slot_spin_nouser,
	AEC_slot_spin_noaccess,
	AEC_slot_spin_noprops,
	AEC_slot_spin_badbet,
	AEC_slot_spin_badsel,
	AEC_slot_spin_nomoney,
	AEC_slot_spin_badbank,
	AEC_slot_spin_sqlbank,
	AEC_slot_doubleup_nobind,
	AEC_slot_doubleup_noscene,
	AEC_slot_doubleup_notslot,
	AEC_slot_doubleup_noclub,
	AEC_slot_doubleup_nouser,
	AEC_slot_doubleup_noaccess,
	AEC_slot_doubleup_noprops,
	AEC_slot_doubleup_nogain,
	AEC_slot_doubleup_sqlbank,
	AEC_slot_collect_nobind,
	AEC_slot_collect_noscene,
	AEC_slot_collect_notslot,
	AEC_slot_collect_noaccess,
	AEC_slot_collect_denied,
	AEC_keno_betget_nobind,
	AEC_keno_betget_noscene,
	AEC_keno_betget_notslot,
	AEC_keno_betget_noaccess,
	AEC_keno_betset_nobind,
	AEC_keno_betset_noscene,
	AEC_keno_betset_notslot,
	AEC_keno_betset_noaccess,
	AEC_keno_betset_badbet,
	AEC_keno_selget_nobind,
	AEC_keno_selget_noscene,
	AEC_keno_selget_notslot,
	AEC_keno_selget_noaccess,
	AEC_keno_selset_nobind,
	AEC_keno_selset_noscene,
	AEC_keno_selset_notslot,
	AEC_keno_selset_noaccess,
	AEC_keno_selset_badsel,
	AEC_keno_selgetslice_nobind,
	AEC_keno_selgetslice_noscene,
	AEC_keno_selgetslice_notslot,
	AEC_keno_selgetslice_noaccess,
	AEC_keno_selsetslice_nobind,
	AEC_keno_selsetslice_noscene,
	AEC_keno_selsetslice_notslot,
	AEC_keno_selsetslice_noaccess,
	AEC_keno_selsetslice_badsel,
	AEC_keno_spin_nobind,
	AEC_keno_spin_noscene,
	AEC_keno_spin_notslot,
	AEC_keno_spin_noclub,
	AEC_keno_spin_nouser,
	AEC_keno_spin_noaccess,
	AEC_keno_spin_badbet,
	AEC_keno_spin_badsel,
	AEC_keno_spin_noprops,
	AEC_keno_spin_nomoney,
	AEC_keno_spin_badbank,
	AEC_keno_spin_sqlbank,
	AEC_prop_get_nobind,
	AEC_prop_get_noclub,
	AEC_prop_get_nouser,
	AEC_prop_get_noaccess,
	AEC_prop_walletget_nobind,
	AEC_prop_walletget_noclub,
	AEC_prop_walletget_nouser,
	AEC_prop_walletget_noaccess,
	AEC_prop_walletadd_nobind,
	AEC_prop_walletadd_limit,
	AEC_prop_walletadd_noclub,
	AEC_prop_walletadd_nouser,
	AEC_prop_walletadd_noaccess,
	AEC_prop_walletadd_noprops,
	AEC_prop_walletadd_nomoney,
	AEC_prop_walletadd_sql,
	AEC_prop_alget_nobind,
	AEC_prop_alget_noclub,
	AEC_prop_alget_nouser,
	AEC_prop_alget_noaccess,
	AEC_prop_alset_nobind,
	AEC_prop_alset_noclub,
	AEC_prop_alset_nouser,
	AEC_prop_alset_noaccess,
	AEC_prop_alset_noprops,
	AEC_prop_alset_nolevel,
	AEC_prop_alset_sql,
	AEC_prop_rtpget_nobind,
	AEC_prop_rtpget_noclub,
	AEC_prop_rtpget_nouser,
	AEC_prop_rtpget_noaccess,
	AEC_prop_rtpset_nobind,
	AEC_prop_rtpset_noclub,
	AEC_prop_rtpset_nouser,
	AEC_prop_rtpset_noaccess,
	AEC_prop_rtpset_noprops,
	AEC_prop_rtpset_sql,
	AEC_user_is_nobind,
	AEC_user_rename_nobind,
	AEC_user_rename_nouser,
	AEC_user_rename_noaccess,
	AEC_user_rename_update,
	AEC_user_secret_nobind,
	AEC_user_secret_smallsec,
	AEC_user_secret_nouser,
	AEC_user_secret_noaccess,
	AEC_user_secret_notequ,
	AEC_user_secret_update,
	AEC_user_delete_nobind,
	AEC_user_delete_nouser,
	AEC_user_delete_noaccess,
	AEC_user_delete_nosecret,
	AEC_user_delete_sqluser,
	AEC_user_delete_sqllock,
	AEC_user_delete_sqlprops,
	AEC_user_delete_sqlgames,
	AEC_club_is_nobind,
	AEC_club_info_nobind,
	AEC_club_info_noclub,
	AEC_club_info_noaccess,
	AEC_club_jpfund_nobind,
	AEC_club_jpfund_noclub,
	AEC_club_rename_nobind,
	AEC_club_rename_noclub,
	AEC_club_rename_noaccess,
	AEC_club_rename_update,
	AEC_club_cashin_nobind,
	AEC_club_cashin_nosum,
	AEC_club_cashin_noclub,
	AEC_club_cashin_noaccess,
	AEC_club_cashin_bankout,
	AEC_club_cashin_fundout,
	AEC_club_cashin_lockout,
	AEC_club_cashin_sqlbank,
	AEC_club_cashin_sqllog,
}

export const Err404 = new Error("page not found");
export const Err405 = new Error("method not allowed");
export const ErrNoClub = new Error("club with given ID does not found");
export const ErrNoUser = new Error("user with given ID does not found");
export const ErrNoProps = new Error("properties for given user and club does not found");
export const ErrNoAddSum = new Error("no sum to change balance of bank or fund or deposit");
export const ErrNoMoney = new Error("not enough money on balance");
export const ErrNoGain = new Error("no money won");
export const ErrBankOut = new Error("not enough money at bank");
export const ErrFundOut = new Error("not enough money at jackpot fund");
export const ErrLockOut = new Error("not enough money at deposit");
export const ErrNotSlot = new Error("specified GID refers to non-slot game");
export const ErrNotKeno = new Error("specified GID refers to non-keno game");
export const ErrNoAccess = new Error("no access rights for this feature");
export const ErrNoLevel = new Error("admin have no privilege to modify specified access level to user");
export const ErrNotConf = new Error("password confirmation does not pass");
export const ErrZero = new Error("given value is zero");
export const ErrTooBig = new Error("given value exceeds the limit");
export const ErrNoAliase = new Error("no game alias");
export const ErrNotOpened = new Error("game with given ID is not opened");
export const ErrBadBank = new Error("can not generate spin with current bank balance");

interface AjaxError {
    what: string;
    code: number;
    uid?: number;
}

// Function to return a formatted error response
export function RetErr(res: Response, status: number, code: AEC, err: Error, uid?: number) {
    const errorResponse: AjaxError = {
        what: err.message,
        code: code,
    };
    if (uid) {
        errorResponse.uid = uid;
    }
    res.status(status).json(errorResponse);
}

// Shortcut functions for common HTTP error statuses
export function Ret400(res: Response, code: AEC, err: Error) {
    RetErr(res, 400, code, err);
}

export function Ret401(res: Response, code: AEC, err: Error) {
    res.setHeader('WWW-Authenticate', 'Basic realm="slotopol", charset="UTF-8"');
    res.setHeader('WWW-Authenticate', 'JWT realm="slotopol", charset="UTF-8"');
    RetErr(res, 401, code, err);
}

export function Ret403(res: Response, code: AEC, err: Error) {
    RetErr(res, 403, code, err);
}

export function Ret404(res: Response, code: AEC, err: Error) {
    RetErr(res, 404, code, err);
}

export function Ret500(res: Response, code: AEC, err: Error) {
    RetErr(res, 500, code, err);
}
