import { z } from "zod"
import { zPartCode } from "~/lib/parts/part-code"
import { zPartMessage } from "~/lib/parts/part-message"

export const zPart = z.union([zPartMessage, zPartCode])
