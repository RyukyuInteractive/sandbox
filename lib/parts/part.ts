import { z } from "zod"
import { zPartFile } from "~/lib/parts/part-file"
import { zPartMessage } from "~/lib/parts/part-message"

export const zPart = z.union([zPartMessage, zPartFile])
